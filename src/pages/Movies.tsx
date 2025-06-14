
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { SearchModal } from '../components/SearchModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { Movie } from '../types/Movie';
import { addToRecentlyWatched } from '../services/recentlyWatched';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../services/watchlistService';
import { KeyboardNavigationProvider, useKeyboardNavigation } from '../components/KeyboardNavigation';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Play, Star, Calendar, Clock } from 'lucide-react';

const MoviesContent = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentUser, userData, logout } = useAuth();
  const { focusedElement } = useKeyboardNavigation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadWatchlist();
    }
    fetchMovies();
  }, [currentUser]);

  const fetchMovies = async () => {
    try {
      const moviesCollection = collection(db, 'movies');
      const movieSnapshot = await getDocs(moviesCollection);
      
      if (movieSnapshot.empty) {
        setLoading(false);
        return;
      }

      const movieList: Movie[] = [];
      
      movieSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        
        const movie: Movie = {
          id: doc.id,
          title: data.title || 'Untitled',
          poster: data.poster || '/placeholder.svg',
          backdrop: data.backdrop || data.poster || '/placeholder.svg',
          year: data.releaseYear || data.year || new Date().getFullYear(),
          genre: data.genre || 'Unknown',
          rating: data.rating || 0,
          duration: data.duration || 'Unknown',
          description: data.description || 'No description available',
          videoUrl: data.videoUrl || data.driveLink || '',
          releaseYear: data.releaseYear,
          language: data.language,
          isTrending: data.isTrending || false,
          isFeatured: data.isFeatured || false,
          views: data.views || 0
        };
        
        movieList.push(movie);
      });
      
      setMovies(movieList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
    }
  };

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
        
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">Loading movies...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No movies available</p>
            <button
              onClick={fetchMovies}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                id={`movie-${index}`}
                className={`bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 group cursor-pointer ${
                  focusedElement === `movie-${index}` ? 'ring-4 ring-red-500' : ''
                }`}
                onClick={() => handleMovieSelect(movie)}
              >
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayMovie(movie);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-600 text-white rounded-full p-3 hover:bg-red-700"
                    >
                      <Play size={24} fill="white" />
                    </button>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {movie.genre}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-2 truncate">{movie.title}</h3>
                  <div className="flex items-center gap-4 text-gray-400 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" fill="currentColor" />
                      <span>{movie.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{movie.year}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{movie.duration}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{movie.description}</p>
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
        movies={movies}
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
