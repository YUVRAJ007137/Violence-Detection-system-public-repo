import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { Plus } from 'lucide-react';
import { CameraCard } from './CameraCard';

interface Camera {
  id: string;
  user_id: string;
  camera_name: string;
  ip_address: string;
  created_at: string;
}

export function CameraList() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [newCamera, setNewCamera] = useState({ camera_name: '', ip_address: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cameras')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCameras(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cameras')
        .insert([
          {
            ...newCamera,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      try {
        if (data) {
          await api.registerCamera(user.id, data.id, data.ip_address);
        }
      } catch (registerError) {
        console.error('Error registering camera with Flask API:', registerError);
      }

      setNewCamera({ camera_name: '', ip_address: '' });
      fetchCameras();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const deleteCamera = async (id: string) => {
    try {
    
       
      try {
        
          const{data ,error: cameraError}= await supabase
              .from('cameras')
              .select('ip_address')
              .eq('id', id);
          
          if(cameraError) throw cameraError;
          
          await api.deleteCamera(data[0].ip_address);
        
      } catch (deleteError) {
        console.error('Error deleting camera with Flask API:', deleteError);

      }

       // Step 1: Delete all notifications associated with the camera
       const { error: notificationError } = await supabase
       .from('notifications')
       .delete()
       .eq('camera_id', id);
 
     if (notificationError) throw notificationError;
 
     // Step 2: Delete the camera
     const { error: cameradeleteError } = await supabase
       .from('cameras')
       .delete()
       .eq('id', id);
 
     if (cameradeleteError) throw cameradeleteError;
      // Step 3: Refresh the list of cameras
      fetchCameras();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) return <div className="text-center p-4 text-white">Loading cameras...</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#141e30] to-[#243b55]">
      <div className="glass rounded-xl p-6 space-y-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center">Cameras</h2>

        <form onSubmit={addCamera} className="glass rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white">Camera Name</label>
              <input
                type="text"
                value={newCamera.camera_name}
                onChange={(e) => setNewCamera({ ...newCamera, camera_name: e.target.value })}
                className="mt-1 block w-full rounded-md bg-white/10 text-white placeholder-white/70 border-none shadow-sm focus:ring focus:ring-blue-500"
                placeholder="Enter camera name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">IP Address</label>
              <input
                type="text"
                value={newCamera.ip_address}
                onChange={(e) => setNewCamera({ ...newCamera, ip_address: e.target.value })}
                className="mt-1 block w-full rounded-md bg-white/10 text-white placeholder-white/70 border-none shadow-sm focus:ring focus:ring-blue-500"
                placeholder="Enter IP address"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Camera
          </button>
        </form>

        {error && <div className="text-red-500 text-center">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((camera) => (
            <CameraCard key={camera.id} camera={camera} onDelete={deleteCamera} />
          ))}
          {cameras.length === 0 && (
            <div className="col-span-full text-center text-white/60 py-8">No cameras added yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
