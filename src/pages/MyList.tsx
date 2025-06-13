
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { SearchModal } from '../components/SearchModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { mockMovies, Movie } from '../data/mockMovies';
import { addToRecentlyWatched } from '../services/recentlyWatched';
import { useNavigate } from 'react-router-dom';

const MyList = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate]);

  const watchlistMovies = mockMovies.filter(movie => watchlist.includes(movie.id));

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowMovieDetail(true);
  };

  const handlePlayMovie = (movie: Movie) => {
    addToRecentlyWatched(movie);
    setSelectedMovie(movie);
    setShowMovieDetail(false);
    setShowVideoPlayer(true);
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    await logout();
    setWatchlist([]);
    navigate('/');
  };

  const handleToggleWatchlist = (movieId: string) => {
    setWatchlist(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
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
      <Navigation
        onSearch={() => setShowSearch(true)}
        onLogin={handleLogin}
        isLoggedIn={!!currentUser}
        onLogout={handleLogout}
        currentUser={userData ? { name: userData.name, email: userData.email } : undefined}
      />

      <div className="pt-20 px-6">
        <h1 className="text-4xl font-bold text-white mb-8">My List</h1>
        
        {watchlistMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">Your watchlist is empty</p>
            <p className="text-gray-500">Add movies to your list by clicking the bookmark icon</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlistMovies.map((movie) => (
              <div
                key={movie.id}
                className="group relative cursor-pointer"
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
                  <p className="text-gray-400 text-sm">{movie.releaseYear}</p>
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

export default MyList;
