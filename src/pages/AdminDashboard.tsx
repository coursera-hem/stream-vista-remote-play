
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MovieUploadForm } from '../components/MovieUploadForm';
import { AnimeUploadForm } from '../components/AnimeUploadForm';
import { MovieManager } from '../components/MovieManager';
import { AnimeManager } from '../components/AnimeManager';
import { EpisodeManager } from '../components/EpisodeManager';
import { Button } from '../components/ui/button';
import { LogOut, ArrowLeft, Film, Tv, Settings, List, Play } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload-movie');
  const [selectedAnimeForEpisodes, setSelectedAnimeForEpisodes] = useState<{id: string, title: string} | null>(null);
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData?.isAdmin) {
      navigate('/');
    }
  }, [userData, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleManageEpisodes = (animeId: string, animeTitle: string) => {
    setSelectedAnimeForEpisodes({ id: animeId, title: animeTitle });
    setActiveTab('manage-episodes');
  };

  if (!userData?.isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackToHome}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <ArrowLeft size={16} className="mr-2" />
                Home
              </Button>
              <h1 className="text-2xl font-bold text-red-600">StreamFlix Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white">Welcome, {userData.name}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-4 py-4">
            <button
              onClick={() => setActiveTab('upload-movie')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                activeTab === 'upload-movie' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Film size={20} />
              Upload Movie
            </button>
            <button
              onClick={() => setActiveTab('upload-anime')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                activeTab === 'upload-anime' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Tv size={20} />
              Upload Anime
            </button>
            <button
              onClick={() => setActiveTab('manage-movies')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                activeTab === 'manage-movies' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Settings size={20} />
              Manage Movies
            </button>
            <button
              onClick={() => setActiveTab('manage-anime')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                activeTab === 'manage-anime' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <List size={20} />
              Manage Anime
            </button>
            {selectedAnimeForEpisodes && (
              <button
                onClick={() => setActiveTab('manage-episodes')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  activeTab === 'manage-episodes' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Play size={20} />
                Manage Episodes
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload-movie' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Upload New Movie</h2>
            <MovieUploadForm />
          </div>
        )}

        {activeTab === 'upload-anime' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Upload New Anime</h2>
            <AnimeUploadForm />
          </div>
        )}

        {activeTab === 'manage-movies' && (
          <MovieManager onBack={() => setActiveTab('upload-movie')} />
        )}

        {activeTab === 'manage-anime' && (
          <AnimeManager 
            onBack={() => setActiveTab('upload-anime')}
            onManageEpisodes={handleManageEpisodes}
          />
        )}

        {activeTab === 'manage-episodes' && selectedAnimeForEpisodes && (
          <EpisodeManager
            animeId={selectedAnimeForEpisodes.id}
            animeTitle={selectedAnimeForEpisodes.title}
            onBack={() => {
              setActiveTab('manage-anime');
              setSelectedAnimeForEpisodes(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
