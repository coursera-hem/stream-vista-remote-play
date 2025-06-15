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
import { useToast } from '../hooks/use-toast';
import { Episode } from '../types/Episode';

interface FirebaseAnime {
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

const Anime = () => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<FirebaseAnime | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [animes, setAnimes] = useState<FirebaseAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    try {
      console.log('Fetching animes from Firebase...');
      console.log('Firebase DB instance:', db);
      
      const animesCollection = collection(db, 'animes');
      console.log('Animes collection reference:', animesCollection);
      
      console.log('Attempting to get all documents from animes collection...');
      const animeSnapshot = await getDocs(animesCollection);
      console.log('Anime snapshot received:', animeSnapshot);
      console.log('Number of docs in snapshot:', animeSnapshot.size);
      console.log('Snapshot empty?', animeSnapshot.empty);
      
      if (animeSnapshot.empty) {
        console.log('No documents found in animes collection');
        toast({
          title: "No Anime Found",
          description: "No anime found in the database. Please upload some anime from the admin dashboard.",
        });
        setAnimes([]);
        setLoading(false);
        return;
      }

      const animeList: FirebaseAnime[] = [];
      
      animeSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Anime ${index + 1} - Doc ID: ${doc.id}`, data);
        
        const anime: FirebaseAnime = {
          id: doc.id,
          title: data.title || 'Untitled',
          description: data.description || 'No description available',
          genre: data.genre || 'Unknown',
          releaseYear: data.releaseYear || new Date().getFullYear(),
          episodes: data.episodes || 0,
          status: data.status || 'Unknown',
          poster: data.poster || '/placeholder.svg',
          videoUrl: data.videoUrl || '',
          rating: data.rating || 0,
          language: data.language || 'Unknown',
          isTrending: data.isTrending || false,
          isFeatured: data.isFeatured || false,
          views: data.views || 0
        };
        
        console.log(`Transformed anime ${index + 1}:`, anime);
        animeList.push(anime);
      });
      
      console.log('Final anime list:', animeList);
      console.log('Total animes fetched:', animeList.length);
      setAnimes(animeList);

      toast({
        title: "Anime Loaded",
        description: `Successfully loaded ${animeList.length} anime from database.`,
      });
      
    } catch (error) {
      console.error('Error fetching animes:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast({
        title: "Error Loading Anime",
        description: `Failed to load anime: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAnimePlay = (anime: FirebaseAnime) => {
    console.log('Playing anime:', anime.title);
    // You can implement video player modal here
  };

  const handleAnimeCardClick = (anime: FirebaseAnime) => {
    setSelectedAnime(anime);
    setShowEpisodeModal(true);
  };

  const handleEpisodePlay = (episode: Episode) => {
    console.log(`Playing episode ${episode.episodeNumber}: ${episode.title}`);
    console.log('Episode video URL:', episode.videoUrl);
    
    // Create a movie-like object for the VideoPlayer component
    setSelectedEpisode(episode);
    setShowEpisodeModal(false);
    setShowVideoPlayer(true);
  };

  const handleVideoPlayerBack = () => {
    setShowVideoPlayer(false);
    setSelectedEpisode(null);
    setShowEpisodeModal(true);
  };

  // Convert Episode to Movie format for VideoPlayer
  const episodeAsMovie = selectedEpisode && selectedAnime ? {
    id: selectedEpisode.id,
    title: `${selectedAnime.title} - Episode ${selectedEpisode.episodeNumber}: ${selectedEpisode.title}`,
    poster: selectedAnime.poster,
    year: selectedAnime.releaseYear,
    genre: selectedAnime.genre,
    rating: selectedAnime.rating,
    duration: selectedEpisode.duration || '24min',
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
              <div className="text-white text-xl">Loading anime collection...</div>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Anime Collection</h1>
            <button
              onClick={fetchAnimes}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Refresh
            </button>
          </div>
          
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-white font-medium mb-2">Debug Information:</h4>
            <div className="text-sm text-gray-400">
              <p>Total Anime Count: {animes.length}</p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Collection: animes</p>
            </div>
          </div>
          
          {animes.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold mb-4">No Anime Available</h2>
                <p className="text-gray-400 mb-6">
                  There are no anime uploaded yet. Check back later for new content!
                </p>
                <button
                  onClick={fetchAnimes}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Refresh Collection
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {animes.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  title={anime.title}
                  poster={anime.poster}
                  genre={anime.genre}
                  releaseYear={anime.releaseYear}
                  episodes={anime.episodes}
                  status={anime.status}
                  rating={anime.rating}
                  description={anime.description}
                  onPlay={() => handleAnimePlay(anime)}
                  onEpisodeSelect={() => handleAnimeCardClick(anime)}
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
        animeTitle={selectedAnime?.title || ''}
        animeId={selectedAnime?.id || ''}
        animePoster={selectedAnime?.poster || ''}
        onEpisodePlay={handleEpisodePlay}
      />
    </div>
  );
};

export default Anime;
