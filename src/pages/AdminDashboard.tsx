
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MovieManager } from '../components/MovieManager';
import { AnimeManager } from '../components/AnimeManager';
import { SeriesManager } from '../components/SeriesManager';
import { EpisodeManager } from '../components/EpisodeManager';
import { MovieUploadForm } from '../components/MovieUploadForm';
import { AnimeUploadForm } from '../components/AnimeUploadForm';
import { SeriesUploadForm } from '../components/SeriesUploadForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { ArrowLeft, Film, Tv, PlaySquare, Upload, Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const AdminDashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAnime, setSelectedAnime] = useState<{ id: string; title: string } | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<{ id: string; title: string } | null>(null);
  const [showMovieUpload, setShowMovieUpload] = useState(false);
  const [showAnimeUpload, setShowAnimeUpload] = useState(false);
  const [showSeriesUpload, setShowSeriesUpload] = useState(false);

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
    console.log('Managing episodes for anime:', { animeId, animeTitle });
    setSelectedAnime({ id: animeId, title: animeTitle });
  };

  const handleManageSeriesEpisodes = (seriesId: string, seriesTitle: string) => {
    console.log('Managing episodes for series:', { seriesId, seriesTitle });
    setSelectedSeries({ id: seriesId, title: seriesTitle });
  };

  const handleBackToAnime = () => {
    setSelectedAnime(null);
  };

  const handleBackToSeries = () => {
    setSelectedSeries(null);
  };

  const handleBackToDashboard = () => {
    setShowMovieUpload(false);
    setShowAnimeUpload(false);
    setShowSeriesUpload(false);
    setSelectedAnime(null);
    setSelectedSeries(null);
  };

  const handleAnimeUploadSuccess = () => {
    toast({
      title: "Success",
      description: "Anime uploaded successfully!"
    });
    handleBackToDashboard();
  };

  const handleSeriesUploadSuccess = () => {
    toast({
      title: "Success",
      description: "Series uploaded successfully!"
    });
    handleBackToDashboard();
  };

  if (!currentUser || !userData?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show Movie Upload Form
  if (showMovieUpload) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Upload New Movie</h1>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <MovieUploadForm />
          </div>
        </div>
      </div>
    );
  }

  // Show Anime Upload Form
  if (showAnimeUpload) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Upload New Anime</h1>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <AnimeUploadForm />
          </div>
        </div>
      </div>
    );
  }

  // Show Series Upload Form
  if (showSeriesUpload) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Upload New Series</h1>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <SeriesUploadForm />
          </div>
        </div>
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
          <EpisodeManager 
            animeId={selectedAnime.id} 
            animeTitle={selectedAnime.title}
            onBack={handleBackToAnime} 
          />
        </div>
      </div>
    );
  }

  if (selectedSeries) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={handleBackToSeries}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Series
            </Button>
            <h1 className="text-3xl font-bold">
              Manage Episodes - {selectedSeries.title}
            </h1>
          </div>
          <EpisodeManager 
            animeId={selectedSeries.id} 
            animeTitle={selectedSeries.title}
            onBack={handleBackToSeries} 
          />
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

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => setShowMovieUpload(true)}
            className="bg-red-600 hover:bg-red-700 h-16 text-lg flex items-center justify-center gap-3"
          >
            <Upload className="w-6 h-6" />
            Upload Movie
          </Button>
          <Button
            onClick={() => setShowSeriesUpload(true)}
            className="bg-green-600 hover:bg-green-700 h-16 text-lg flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Upload Series
          </Button>
          <Button
            onClick={() => setShowAnimeUpload(true)}
            className="bg-blue-600 hover:bg-blue-700 h-16 text-lg flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Upload Anime
          </Button>
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
              value="series" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <PlaySquare className="w-4 h-4" />
              Series
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
              <AnimeManager onBack={() => navigate('/')} onManageEpisodes={handleManageEpisodes} />
            </div>
          </TabsContent>

          <TabsContent value="series" className="mt-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <PlaySquare className="w-6 h-6 text-red-600" />
                Series Management
              </h2>
              <p className="text-gray-400 mb-6">
                Upload, edit, and manage TV series in your collection.
              </p>
              <SeriesManager onBack={() => navigate('/')} onManageEpisodes={handleManageSeriesEpisodes} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
