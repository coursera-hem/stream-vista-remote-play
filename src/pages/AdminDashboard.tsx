
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MovieUploadForm } from '../components/MovieUploadForm';
import { AnimeUploadForm } from '../components/AnimeUploadForm';
import { MovieManager } from '../components/MovieManager';
import { Button } from '../components/ui/button';
import { LogOut, Upload, List, ArrowLeft, Film, Tv } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload-movie');
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

  if (!userData?.isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
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
              <nav className="flex gap-4">
                <button
                  onClick={() => setActiveTab('upload-movie')}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    activeTab === 'upload-movie' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Film size={20} />
                  Upload Movie
                </button>
                <button
                  onClick={() => setActiveTab('upload-anime')}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    activeTab === 'upload-anime' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Tv size={20} />
                  Upload Anime
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    activeTab === 'manage' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <List size={20} />
                  Manage Content
                </button>
              </nav>
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

        {activeTab === 'manage' && (
          <MovieManager onBack={() => setActiveTab('upload-movie')} />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
