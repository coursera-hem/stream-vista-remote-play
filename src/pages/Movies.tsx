
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { SearchModal } from '../components/SearchModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { mockMovies, Movie } from '../data/mockMovies';
import { addToRecentlyWatched } from '../services/recentlyWatched';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../services/watchlistService';
import { KeyboardNavigationProvider, useKeyboardNavigation } from '../components/KeyboardNavigation';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const MoviesContent = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const { currentUser, userData, logout } = useAuth();
  const { focusedElement } = useKeyboardNavigation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadWatchlist();
    }
  }, [currentUser]);

  const loadWatchlist = async () => {
    if (!currentUser) return;
    
    try {
      const userWatchlist = await getWatchlist(currentUser.uid);
      setWatchlist(userWatchlist);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

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
    if (!currentUser) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to add movies to your watchlist",
        variant: "destructive"
      });
      return;
    }

    try {
      if (watchlist.includes(movieId)) {
        await removeFromWatchlist(currentUser.uid, movieId);
        setWatchlist(prev => prev.filter(id => id !== movieId));
        toast({
          title: "Removed from watchlist",
          description: "Movie removed from your list"
        });
      } else {
        await addToWatchlist(currentUser.uid, movieId);
        setWatchlist(prev => [...prev, movieId]);
        toast({
          title: "Added to watchlist",
          description: "Movie added to your list"
        });
      }
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        onLogout={handleLogout}
        isLoggedIn={!!currentUser}
        onLogin={handleLogin}
      />

      <div className="pl-4 pt-16 pr-6">
        <h1 className="text-4xl font-bold text-white mb-8">All Movies</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mockMovies.map((movie, index) => (
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

const Movies = () => {
  return (
    <KeyboardNavigationProvider>
      <MoviesContent />
    </KeyboardNavigationProvider>
  );
};

export default Movies;
