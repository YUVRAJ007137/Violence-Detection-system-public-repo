import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { CameraStream } from './CameraStream';

interface CameraCardProps {
  camera: {
    id: string;
    camera_name: string;
    ip_address: string;
    created_at: string;
  };
  onDelete: (id: string) => void;
}

export function CameraCard({ camera, onDelete }: CameraCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/camera/${camera.id}`);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden bg-white/10 backdrop-blur-lg shadow-lg border border-white/20 transition-transform hover:scale-105 hover:shadow-xl">
      {/* Header Section */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-white">{camera.camera_name}</h3>
            <p className="text-sm text-white/80">{camera.ip_address}</p>
            <p className="text-xs text-white/60 mt-1">
              Added: {new Date(camera.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => onDelete(camera.id)}
            className="text-white/60 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Camera Stream Section */}
      <div
        className="mt-2 aspect-video cursor-pointer relative overflow-hidden bg-gradient-to-r from-blue-600 to-red-600 hover:from-red-600 hover:to-blue-600 transition-all"
        onClick={handleClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-center font-medium opacity-80">
            Loading Stream...
          </p>
        </div>
        <CameraStream
          ipAddress={camera.ip_address}
          cameraName={camera.camera_name}
        />
      </div>
    </div>
  );
}
