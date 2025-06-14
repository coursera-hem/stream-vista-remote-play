
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { FilePlus, Users, PlaySquare, Tv, Film } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { MovieManager } from '../components/MovieManager';
import { AnimeManager } from '../components/AnimeManager';
import { SeriesManager } from '../components/SeriesManager';
import { MovieUploadForm } from '../components/MovieUploadForm';
import { AnimeUploadForm } from '../components/AnimeUploadForm';
import { SeriesUploadForm } from '../components/SeriesUploadForm';
import { EpisodeUploadForm } from '../components/EpisodeUploadForm';
import { EpisodeManager } from '../components/EpisodeManager';

const AdminDashboard = () => {
  const { currentUser, userData, logout, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<'dashboard' | 'movies' | 'anime' | 'series' | 'users'>('dashboard');
  const [showMovieUpload, setShowMovieUpload] = useState(false);
  const [showAnimeUpload, setShowAnimeUpload] = useState(false);
  const [showSeriesUpload, setShowSeriesUpload] = useState(false);
  const [managingEpisodes, setManagingEpisodes] = useState<{ animeId: string, animeTitle: string } | null>(null);

  // Immediate and comprehensive access control
  useEffect(() => {
    // Don't check while still loading
    if (loading) return;

    // Redirect if no user is logged in
    if (!currentUser) {
      console.log('AdminDashboard: No current user, redirecting to signin');
      toast({
        title: "Access Denied",
        description: "Please sign in to access the admin panel.",
        variant: "destructive"
      });
      navigate('/signin', { replace: true });
      return;
    }

    // Redirect if user is not an admin
    if (!userData?.isAdmin) {
      console.log('AdminDashboard: User is not admin, redirecting to home');
      toast({
        title: "Access Denied", 
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      navigate('/', { replace: true });
      return;
    }

    console.log('AdminDashboard: Access granted for admin user');
  }, [currentUser, userData, loading, navigate, toast]);

  // Show loading state while verifying authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Verifying admin access...</div>
      </div>
    );
  }

  // Block rendering if user is not authenticated or not admin
  if (!currentUser || !userData?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Redirecting...</div>
      </div>
    );
  }

  const handleManageEpisodes = (animeId: string, animeTitle: string) => {
    setManagingEpisodes({ animeId, animeTitle });
  };

  const handleManageSeriesEpisodes = (seriesId: string, seriesTitle: string) => {
    setManagingEpisodes({ animeId: seriesId, animeTitle: seriesTitle });
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Episode management view
  if (managingEpisodes) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Sidebar
          onLogout={handleLogout}
          isLoggedIn={!!currentUser}
          onLogin={handleLogin}
        />

        <div className="px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6 pt-6">
              <Button
                onClick={() => setManagingEpisodes(null)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                ← Back to Admin Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-white">
                Manage Episodes for "{managingEpisodes.animeTitle}"
              </h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EpisodeUploadForm 
                animeId={managingEpisodes.animeId}
                animeTitle={managingEpisodes.animeTitle}
                onEpisodeAdded={() => {}}
              />
              <EpisodeManager 
                animeId={managingEpisodes.animeId}
                onBack={() => setManagingEpisodes(null)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        onLogout={handleLogout}
        isLoggedIn={!!currentUser}
        onLogin={handleLogin}
      />

      <div className="px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 pt-6">Admin Dashboard</h1>
          
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setActiveSection('movies')}
                >
                  <div className="flex items-center gap-3">
                    <Film className="w-8 h-8 text-red-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Movies</h3>
                      <p className="text-gray-400">Manage movie content</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setActiveSection('anime')}
                >
                  <div className="flex items-center gap-3">
                    <Tv className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Anime</h3>
                      <p className="text-gray-400">Manage anime content</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setActiveSection('series')}
                >
                  <div className="flex items-center gap-3">
                    <PlaySquare className="w-8 h-8 text-green-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Series</h3>
                      <p className="text-gray-400">Manage series content</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setActiveSection('users')}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-purple-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Users</h3>
                      <p className="text-gray-400">Manage user accounts</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => setShowMovieUpload(true)}
                    className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                  >
                    <FilePlus size={16} />
                    Upload Movie
                  </Button>
                  <Button 
                    onClick={() => setShowAnimeUpload(true)}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FilePlus size={16} />
                    Upload Anime
                  </Button>
                  <Button 
                    onClick={() => setShowSeriesUpload(true)}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <FilePlus size={16} />
                    Upload Series
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'movies' && (
            <MovieManager onBack={() => setActiveSection('dashboard')} />
          )}

          {activeSection === 'anime' && (
            <AnimeManager 
              onBack={() => setActiveSection('dashboard')}
              onManageEpisodes={handleManageEpisodes}
            />
          )}

          {activeSection === 'series' && (
            <SeriesManager 
              onBack={() => setActiveSection('dashboard')}
              onManageEpisodes={handleManageSeriesEpisodes}
            />
          )}

          {activeSection === 'users' && (
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={() => setActiveSection('dashboard')}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  ← Back to Dashboard
                </Button>
                <h2 className="text-2xl font-bold text-white">User Management</h2>
              </div>
              <p className="text-gray-400">User management features coming soon...</p>
            </div>
          )}

          {showMovieUpload && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Upload Movie</h2>
                    <button
                      onClick={() => setShowMovieUpload(false)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <MovieUploadForm />
                </div>
              </div>
            </div>
          )}

          {showAnimeUpload && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Upload Anime</h2>
                    <button
                      onClick={() => setShowAnimeUpload(false)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <AnimeUploadForm />
                </div>
              </div>
            </div>
          )}

          {showSeriesUpload && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Upload Series</h2>
                    <button
                      onClick={() => setShowSeriesUpload(false)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <SeriesUploadForm />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
