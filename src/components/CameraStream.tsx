import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, AlertCircle, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CameraStreamProps {
  ipAddress: string;
  cameraName: string;
}

export function CameraStream({ ipAddress, cameraName }: CameraStreamProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);

  // Fetch camera ID based on IP address
  useEffect(() => {
    const fetchCameraId = async () => {
      const { data, error } = await supabase
        .from('cameras')
        .select('id')
        .eq('ip_address', ipAddress)
        .single();

      if (data) setCameraId(data.id);
      if (error) console.error('Error fetching camera ID:', error);
    };

    fetchCameraId();
  }, [ipAddress]);

  // Set up notification listener
  useEffect(() => {
    notificationSound.current = new Audio('/notification.mp3');

    if (!cameraId) return;

    const channel = supabase
      .channel(`camera-${cameraId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `camera_id=eq.${cameraId}`,
        },
        () => {
          notificationSound.current?.play().catch((error) => {
            console.error('Notification sound error:', error);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cameraId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-gray-900 flex items-center justify-center'
          : 'w-full h-full rounded-lg overflow-hidden shadow'
      }`}
    >
      {/* Existing camera stream rendering logic */}
      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-gray-700 text-lg font-medium">Unable to connect to camera</p>
          <p className="text-sm text-gray-500">{ipAddress}</p>
          <p className="text-sm text-gray-500">Please check the following:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>- Camera is powered on</li>
            <li>- Camera is connected to the network</li>
            <li>- IP address is correct</li>
            <li>- Port 8080 is open and accessible</li>
          </ul>
          <button
            onClick={() => setError(false)}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm text-sm"
          >
            <RefreshCcw size={16} />
            <span>Retry Stream</span>
          </button>
        </div>
      ) : (
        <>
          <img
            src={`http://${ipAddress}`}
            alt={`Stream from ${cameraName}`}
            className={`${
              isFullscreen ? 'w-full h-full object-contain' : 'w-full h-full object-cover'
            }`}
            onError={() => setError(true)}
          />
          <button
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 p-2 bg-black/70 rounded-full text-white hover:bg-black/90 focus:outline-none focus:ring focus:ring-white"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          {!isFullscreen && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
              {cameraName}
            </div>
          )}
        </>
      )}
    </div>
  );
}