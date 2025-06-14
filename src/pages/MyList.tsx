
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { SearchModal } from '../components/SearchModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { Movie } from '../types/Movie';
import { addToRecentlyWatched } from '../services/recentlyWatched';
import { addToWatchlist, removeFromWatchlist, subscribeToWatchlist, migrateWatchlistData } from '../services/watchlistService';
import { KeyboardNavigationProvider, useKeyboardNavigation } from '../components/KeyboardNavigation';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const MyListContent = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);

  const { currentUser, userData, logout } = useAuth();
  const { focusedElement } = useKeyboardNavigation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    console.log('MyList useEffect triggered for user:', currentUser.uid);
    
    const initializeData = async () => {
      try {
        console.log('Starting data initialization...');
        
        // First, try to migrate any old data
        const migrated = await migrateWatchlistData(currentUser.uid);
        if (migrated) {
          console.log('Data migration completed');
        }
        
        // Fetch all movies first
        console.log('Fetching all movies...');
        const moviesCollection = collection(db, 'movies');
        const movieSnapshot = await getDocs(moviesCollection);
        
        console.log('Movies snapshot empty:', movieSnapshot.empty);
        console.log('Movies count:', movieSnapshot.docs.length);

        if (movieSnapshot.empty) {
          console.log('No movies found in database');
          setAllMovies([]);
          setLoading(false);
          return;
        }

        const movieList: Movie[] = [];
        
        movieSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          console.log('Processing movie:', doc.id, data.title);
          
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
        
        console.log('Total movies loaded:', movieList.length);
        setAllMovies(movieList);
        
        // Set up subscription after movies are loaded
        console.log('Setting up my list subscription for user:', currentUser.uid);
        const unsubscribe = subscribeToWatchlist(currentUser.uid, (movieIds) => {
          console.log('My list updated via subscription:', movieIds);
          setWatchlist(movieIds);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error in data initialization:', error);
        setLoading(false);
      }
    };
    
    initializeData().then((unsubscribe) => {
      if (unsubscribe) {
        return () => {
          console.log('Cleaning up my list subscription');
          unsubscribe();
        };
      }
    });
  }, [currentUser, navigate]);
  
  // Update watchlist movies whenever allMovies or watchlist changes
  useEffect(() => {
    console.log('Updating watchlist movies - allMovies count:', allMovies.length, 'watchlist count:', watchlist.length);
    console.log('Current watchlist movie IDs:', watchlist);
    
    if (allMovies.length > 0 && watchlist.length > 0) {
      const filteredMovies = allMovies.filter(movie => {
        const isInWatchlist = watchlist.includes(movie.id);
        console.log('Movie', movie.title, 'is in watchlist:', isInWatchlist);
        return isInWatchlist;
      });
      console.log('Filtered movies for display:', filteredMovies.map(m => m.title));
      setWatchlistMovies(filteredMovies);
    } else {
      console.log('Setting empty watchlist movies');
      setWatchlistMovies([]);
    }
  }, [allMovies, watchlist]);

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
          title: "Removed from list",
          description: "Movie removed from your list"
        });
      } else {
        await addToWatchlist(currentUser.uid, movieId);
        toast({
          title: "Added to list",
          description: "Movie added to your list"
        });
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to update list",
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

  console.log('Rendering MyList - loading:', loading, 'watchlistMovies count:', watchlistMovies.length);

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
            <p className="text-gray-400 text-xl">Loading your list...</p>
          </div>
        ) : watchlistMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">Your list is empty</p>
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
        movies={allMovies}
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
