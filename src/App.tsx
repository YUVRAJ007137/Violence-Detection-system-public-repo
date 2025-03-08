import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { CameraList } from './components/CameraList';
import { NotificationList } from './components/NotificationList';
import { CameraDetails } from './components/CameraDetails';
import { VideoAnalysis } from './components/VideoAnalysis';
import { LogOut, Camera, Bell, Video, Menu, X } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setLoading(false);
      setError(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-green-400 to-blue-500"></div>
      </div>
    );
  }

  // Show error state if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-red-600 text-lg font-semibold mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-r from-gray-100 via-white to-gray-200">
        <nav className="bg-gradient-to-r from-green-400 to-blue-500 shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="hidden md:flex space-x-4">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border-b-2 border-transparent text-white hover:text-gray-200 hover:border-gray-300"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Cameras
                  </Link>
                  <Link
                    to="/notifications"
                    className="inline-flex items-center px-4 py-2 border-b-2 border-transparent text-white hover:text-gray-200 hover:border-gray-300"
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </Link>
                  <Link
                    to="/video-analysis"
                    className="inline-flex items-center px-4 py-2 border-b-2 border-transparent text-white hover:text-gray-200 hover:border-gray-300"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Video Analysis
                  </Link>
                </div>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-white"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
              <div className="flex items-center">
                <span className="hidden md:block text-sm text-white mr-4">
                  {session.user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-200 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Camera className="w-5 h-5 inline mr-2" />
                  Cameras
                </Link>
                <Link
                  to="/notifications"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-200 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Bell className="w-5 h-5 inline mr-2" />
                  Notifications
                </Link>
                <Link
                  to="/video-analysis"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-200 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Video className="w-5 h-5 inline mr-2" />
                  Video Analysis
                </Link>
              </div>
            </div>
          )}
        </nav>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<CameraList />} />
            <Route path="/notifications" element={<NotificationList />} />
            <Route path="/camera/:id" element={<CameraDetails />} />
            <Route path="/video-analysis" element={<VideoAnalysis />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
