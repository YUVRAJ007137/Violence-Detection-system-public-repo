import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { Upload, AlertTriangle, CheckCircle, Clock, Loader } from 'lucide-react';
import { format } from 'date-fns';

interface VideoAnalysis {
  id: string;
  user_id: string;
  video_url: string;
  status: 'pending' | 'processing' | 'completed';
  results: string | null;
  created_at: string;
}

export function VideoAnalysis() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyses();

    const subscribeToChanges = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const channel = supabase
        .channel('video_analysis_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'video_analysis',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchAnalyses();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    subscribeToChanges();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAnalyses([]);
        return;
      }

      const { data, error } = await supabase
        .from('video_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('File size must be less than 100MB');
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        throw new Error('Please upload a video file');
      }

      setError(null);
      setUploading(true);
      setUploadProgress(0);

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('video-analysis')
        .upload(filePath, file, {
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percent));
          },
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('video-analysis')
        .getPublicUrl(uploadData.path);

      // Register the public URL with Flask API
      if (publicUrl) {
        await api.registerVideo(publicUrl);
      }

      // Create the analysis record
      const { error: dbError } = await supabase
        .from('video_analysis')
        .insert([
          {
            user_id: user.id,
            video_url: publicUrl,
            status: 'pending',
          },
        ]);

      if (dbError) throw dbError;

      // Reset the file input
      event.target.value = '';

      // Refresh the list
      await fetchAnalyses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleStatusClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank'); // Open video in a new tab
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Video Analysis</h2>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <label className="block">
            <span className="sr-only">Choose video file</span>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {uploading ? (
                  <div className="space-y-2">
                    <Loader className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            Uploading...
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${uploadProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a video</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="video/*"
                          onChange={handleUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">MP4, AVI up to 100MB</p>
                  </>
                )}
              </div>
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-500">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(analysis.status)}
                  <button
                    onClick={() => handleStatusClick(analysis.video_url)}
                    className="font-medium capitalize text-white hover:underline"
                  >
                    {analysis.status}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Uploaded {format(new Date(analysis.created_at), 'PPp')}
                </p>
              </div>

              {analysis.status === 'completed' && analysis.results && (
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    Violence Detected:
                    <span
                      className={
                        analysis.results === 'Yes'
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {` ${analysis.results}`}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {analyses.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No videos analyzed yet
          </div>
        )}
      </div>
    </div>
  );
}