import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CameraStream } from './CameraStream';
import { format } from 'date-fns';
import {api} from '../lib/api';

interface Notification {
  id: string;
  notification_text: string;
  timestamp: string;
  camera_id: string; // Ensure this matches your database schema
}

interface Camera {
  id: string;
  camera_name: string;
  ip_address: string;
  detection_status: string; // New field for detection status
}

export function CameraDetails() {
  const { id } = useParams<{ id: string }>();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<string>('stopped');

  useEffect(() => {
    // Fetch initial camera and notifications data
    fetchCameraAndNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel(`camera-${id}`) // Unique channel name for this camera
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `camera_id=eq.${id}`, // Filter for notifications specific to this camera
        },
        (payload) => {
          // Add the new notification to the top of the list
          setNotifications((current) => [payload.new as Notification, ...current]);
        }
      )
      .subscribe();

    // Cleanup function to remove the channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Function to fetch camera details and notifications
  const fetchCameraAndNotifications = async () => {
    try {
      // Fetch camera details
      const cameraResult = await supabase
        .from('cameras')
        .select('*')
        .eq('id', id)
        .single();

      // Fetch notifications for this camera, ordered by timestamp (newest first)
      const notificationsResult = await supabase
        .from('notifications')
        .select('*')
        .eq('camera_id', id)
        .order('timestamp', { ascending: false });

      // Handle errors
      if (cameraResult.error) throw cameraResult.error;
      if (notificationsResult.error) throw notificationsResult.error;

      // Update state with fetched data
      setCamera(cameraResult.data);
      setNotifications(notificationsResult.data || []);
      setDetectionStatus(cameraResult.data.detection_status); // Set the detection status
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetection = async () => {
    try {
      const newStatus = detectionStatus === 'stopped' ? 'started' : 'stopped';
      
      api.update_detection_status(newStatus, id);
     
      setDetectionStatus(newStatus);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Loading state
  if (loading) return <div className="text-center p-4 text-white">Loading...</div>;

  // Error state
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

  // Camera not found state
  if (!camera) return <div className="text-center p-4 text-white">Camera not found</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#141e30] to-[#243b55]">
      <div className="glass rounded-xl p-6 space-y-8 max-w-4xl mx-auto">
        {/* Camera Name */}
        <h2 className="text-3xl font-bold text-white">{camera.camera_name}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Feed Section */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Live Feed</h3>
            <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
              <CameraStream ipAddress={camera.ip_address} cameraName={camera.camera_name} />
            </div>
          </div>

          {/* Notifications Section */}
          <div className="glass rounded-xl p-6 max-h-[600px] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Notifications</h3>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 glass rounded-lg mb-4 text-white/90 border border-white/20"
                >
                  <p className="font-medium">{notification.notification_text}</p>
                  <p className="text-sm text-white/70 mt-1">
                    {format(new Date(notification.timestamp), 'PPp')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-4">No notifications yet</p>
            )}
          </div>
        </div>

        {/* Detection Control Section */}
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-xl font-semibold text-white mb-4">
            Detection Status: {detectionStatus === 'stopped' ? 'Detection stopped' : 'Detection started'}
          </p>
          <button
            onClick={toggleDetection}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {detectionStatus === 'stopped' ? 'Start Detection' : 'Stop Detection'}
          </button>
        </div>
      </div>
    </div>
  );
}