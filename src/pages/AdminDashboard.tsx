
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MovieManager } from '../components/MovieManager';
import { AnimeManager } from '../components/AnimeManager';
import { EpisodeManager } from '../components/EpisodeManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { ArrowLeft, Film, Tv, PlaySquare } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const AdminDashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAnime, setSelectedAnime] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (!userData?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  }, [currentUser, userData, navigate, toast]);

  const handleManageEpisodes = (animeId: string, animeTitle: string) => {
    setSelectedAnime({ id: animeId, title: animeTitle });
  };

  const handleBackToAnime = () => {
    setSelectedAnime(null);
  };

  if (!currentUser || !userData?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (selectedAnime) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={handleBackToAnime}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Anime
            </Button>
            <h1 className="text-3xl font-bold">
              Manage Episodes - {selectedAnime.title}
            </h1>
          </div>
          <EpisodeManager animeId={selectedAnime.id} onBack={handleBackToAnime} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-red-600">Admin Dashboard</h1>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Welcome, {userData.name}</p>
            <p className="text-sm text-red-400">Administrator</p>
          </div>
        </div>

        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-700">
            <TabsTrigger 
              value="movies" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Film className="w-4 h-4" />
              Movies
            </TabsTrigger>
            <TabsTrigger 
              value="anime" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Tv className="w-4 h-4" />
              Anime
            </TabsTrigger>
            <TabsTrigger 
              value="episodes" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <PlaySquare className="w-4 h-4" />
              Episodes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="mt-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Film className="w-6 h-6 text-red-600" />
                Movie Management
              </h2>
              <p className="text-gray-400 mb-6">
                Upload, edit, and manage movies in your collection.
              </p>
              <MovieManager onBack={() => navigate('/')} />
            </div>
          </TabsContent>

          <TabsContent value="anime" className="mt-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Tv className="w-6 h-6 text-red-600" />
                Anime Management
              </h2>
              <p className="text-gray-400 mb-6">
                Upload, edit, and manage anime series in your collection.
              </p>
              <AnimeManager onBack={() => navigate('/')} />
            </div>
          </TabsContent>

          <TabsContent value="episodes" className="mt-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <PlaySquare className="w-6 h-6 text-red-600" />
                Episode Management
              </h2>
              <p className="text-gray-400 mb-6">
                Select an anime from the Anime tab to manage its episodes, or use the quick episode management below.
              </p>
              {selectedAnime ? (
                <EpisodeManager animeId={selectedAnime.id} onBack={handleBackToAnime} />
              ) : (
                <div className="text-center py-12">
                  <PlaySquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    No anime selected for episode management
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Go to the Anime tab and click "Manage Episodes" on any anime series
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
