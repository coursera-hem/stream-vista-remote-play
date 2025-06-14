
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Sidebar } from '../components/Sidebar';
import { SearchModal } from '../components/SearchModal';
import { LoginModal } from '../components/LoginModal';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeEpisodeModal } from '../components/AnimeEpisodeModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Episode } from '../types/Episode';

interface FirebaseSeries {
  id: string;
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  episodes: number;
  status: string;
  poster: string;
  videoUrl: string;
  rating: number;
  language: string;
  isTrending: boolean;
  isFeatured: boolean;
  views: number;
}

const Series = () => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<FirebaseSeries | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [series, setSeries] = useState<FirebaseSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      console.log('Fetching series from Firebase...');
      const seriesCollection = collection(db, 'series');
      const seriesSnapshot = await getDocs(seriesCollection);
      const seriesList = seriesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Series data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      }) as FirebaseSeries[];
      
      console.log('Total series fetched:', seriesList.length);
      setSeries(seriesList);
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSeriesPlay = (series: FirebaseSeries) => {
    console.log('Playing series directly:', series.title);
    
    // Create a movie-like object for the VideoPlayer component
    const seriesAsMovie = {
      id: series.id,
      title: series.title,
      poster: series.poster,
      year: series.releaseYear,
      genre: series.genre,
      rating: series.rating,
      duration: '45min', // Default duration for series
      videoUrl: series.videoUrl
    };

    setSelectedSeries(series);
    setSelectedEpisode({
      id: series.id,
      seriesId: series.id,
      episodeNumber: 1,
      title: series.title,
      description: series.description,
      videoUrl: series.videoUrl,
      duration: '45min',
      thumbnail: series.poster,
      uploadedAt: new Date()
    });
    setShowVideoPlayer(true);
  };

  const handleSeriesCardClick = (series: FirebaseSeries) => {
    setSelectedSeries(series);
    setShowEpisodeModal(true);
  };

  const handleEpisodePlay = (episode: Episode) => {
    console.log(`Playing episode ${episode.episodeNumber}: ${episode.title}`);
    console.log('Episode video URL:', episode.videoUrl);
    
    setSelectedEpisode(episode);
    setShowEpisodeModal(false);
    setShowVideoPlayer(true);
  };

  const handleVideoPlayerBack = () => {
    setShowVideoPlayer(false);
    setSelectedEpisode(null);
    setSelectedSeries(null);
  };

  // Convert Episode to Movie format for VideoPlayer
  const episodeAsMovie = selectedEpisode && selectedSeries ? {
    id: selectedEpisode.id,
    title: selectedEpisode.episodeNumber === 1 && selectedEpisode.title === selectedSeries.title 
      ? selectedSeries.title
      : `${selectedSeries.title} - Episode ${selectedEpisode.episodeNumber}: ${selectedEpisode.title}`,
    poster: selectedSeries.poster,
    year: selectedSeries.releaseYear,
    genre: selectedSeries.genre,
    rating: selectedSeries.rating,
    duration: selectedEpisode.duration || '45min',
    videoUrl: selectedEpisode.videoUrl
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Sidebar
          onLogout={handleLogout}
          isLoggedIn={!!currentUser}
          onLogin={() => setShowLoginModal(true)}
        />

        <main className="pt-16 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-white text-xl">Loading series collection...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show video player when an episode is selected
  if (showVideoPlayer && episodeAsMovie) {
    return (
      <VideoPlayer
        movie={episodeAsMovie}
        onBack={handleVideoPlayerBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        onLogout={handleLogout}
        isLoggedIn={!!currentUser}
        onLogin={() => setShowLoginModal(true)}
      />

      <main className="pt-16 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">TV Series Collection</h1>
          
          {series.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold mb-4">No Series Available</h2>
                <p className="text-gray-400 mb-6">
                  There are no TV series uploaded yet. Check back later for new content!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {series.map((seriesItem) => (
                <AnimeCard
                  key={seriesItem.id}
                  id={seriesItem.id}
                  title={seriesItem.title}
                  poster={seriesItem.poster}
                  genre={seriesItem.genre}
                  releaseYear={seriesItem.releaseYear}
                  episodes={seriesItem.episodes}
                  status={seriesItem.status}
                  rating={seriesItem.rating}
                  description={seriesItem.description}
                  onPlay={() => handleSeriesPlay(seriesItem)}
                  onEpisodeSelect={() => handleSeriesCardClick(seriesItem)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onMovieSelect={() => {}}
        movies={[]}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => navigate('/signin')}
        onRegister={() => navigate('/signup')}
      />

      <AnimeEpisodeModal
        isOpen={showEpisodeModal}
        onClose={() => setShowEpisodeModal(false)}
        animeTitle={selectedSeries?.title || ''}
        animeId={selectedSeries?.id || ''}
        animePoster={selectedSeries?.poster || ''}
        onEpisodePlay={handleEpisodePlay}
      />
    </div>
  );
};

export default Series;
