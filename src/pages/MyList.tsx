
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { SearchModal } from '../components/SearchModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { mockMovies, Movie } from '../data/mockMovies';
import { addToRecentlyWatched } from '../services/recentlyWatched';
import { addToWatchlist, removeFromWatchlist, subscribeToWatchlist } from '../services/watchlistService';
import { KeyboardNavigationProvider, useKeyboardNavigation } from '../components/KeyboardNavigation';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const MyListContent = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentUser, userData, logout } = useAuth();
  const { focusedElement } = useKeyboardNavigation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    console.log('Setting up watchlist subscription for user:', currentUser.uid);
    const unsubscribe = subscribeToWatchlist(currentUser.uid, (movieIds) => {
      console.log('Watchlist updated:', movieIds);
      setWatchlist(movieIds);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up watchlist subscription');
      unsubscribe();
    };
  }, [currentUser, navigate]);

  const watchlistMovies = mockMovies.filter(movie => {
    const isInList = watchlist.includes(movie.id);
    console.log(`Movie ${movie.title} (${movie.id}) in watchlist:`, isInList);
    return isInList;
  });

  console.log('Watchlist IDs:', watchlist);
  console.log('Watchlist Movies:', watchlistMovies.map(m => ({ id: m.id, title: m.title })));

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowMovieDetail(true);
  };

  const handlePlayMovie = (movie: Movie) => {
    addToRecentlyWatched(movie);
    setSelectedMovie(movie);
    setShowMovieDetail(false);
    setShowVideoPlayer(true);
    
    toast({
      title: "Now Playing",
      description: `Playing ${movie.title}`
    });
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    await logout();
    setWatchlist([]);
    navigate('/');
    
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out"
    });
  };

  const handleToggleWatchlist = async (movieId: string) => {
    if (!currentUser) return;

    try {
      if (watchlist.includes(movieId)) {
        await removeFromWatchlist(currentUser.uid, movieId);
        toast({
          title: "Removed from watchlist",
          description: "Movie removed from your list"
        });
      } else {
        await addToWatchlist(currentUser.uid, movieId);
        toast({
          title: "Added to watchlist",
          description: "Movie added to your list"
        });
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to update watchlist",
        variant: "destructive"
      });
    }
  };

  if (showVideoPlayer && selectedMovie) {
    return (
      <VideoPlayer
        movie={selectedMovie}
        onBack={() => setShowVideoPlayer(false)}
      />
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        onLogout={handleLogout}
        isLoggedIn={!!currentUser}
        onLogin={handleLogin}
      />

      <div className="pl-4 pt-16 pr-6">
        <h1 className="text-4xl font-bold text-white mb-8">My List</h1>
        
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">Loading your watchlist...</p>
          </div>
        ) : watchlistMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">Your watchlist is empty</p>
            <p className="text-gray-500 mb-6">Add movies to your list by clicking the bookmark icon</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlistMovies.map((movie, index) => (
              <div
                key={movie.id}
                id={`movie-${index}`}
                className={`group relative cursor-pointer transition-all duration-300 ${
                  focusedElement === `movie-${index}` ? 'ring-4 ring-red-500 scale-105' : ''
                }`}
                onClick={() => handleMovieSelect(movie)}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">
                      Play
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-white font-semibold truncate">{movie.title}</h3>
                  <p className="text-gray-400 text-sm">{movie.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onMovieSelect={handleMovieSelect}
        movies={mockMovies}
      />

      <MovieDetailModal
        movie={selectedMovie}
        isOpen={showMovieDetail}
        onClose={() => setShowMovieDetail(false)}
        onPlay={handlePlayMovie}
        isInWatchlist={selectedMovie ? watchlist.includes(selectedMovie.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  );
};

const MyList = () => {
  return (
    <KeyboardNavigationProvider>
      <MyListContent />
    </KeyboardNavigationProvider>
  );
};

export default MyList;
