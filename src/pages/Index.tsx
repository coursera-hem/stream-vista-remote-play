
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FocusProvider } from '../components/FocusProvider';
import { Navigation } from '../components/Navigation';
import { HeroSection } from '../components/HeroSection';
import { MovieCarousel } from '../components/MovieCarousel';
import { SearchModal } from '../components/SearchModal';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { LoginModal } from '../components/LoginModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { useAuth } from '../contexts/AuthContext';
import { addToRecentlyWatched, getRecentlyWatched } from '../services/recentlyWatched';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

interface AppMovie {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
  description: string;
  videoUrl: string;
  releaseYear?: number;
  language?: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  views?: number;
}

interface RecentlyWatchedMovie {
  id: string;
  title: string;
  poster: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
}

const Index = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<AppMovie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatchedMovie[]>([]);
  const [movies, setMovies] = useState<AppMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState<AppMovie | null>(null);

  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchMovies();
    setRecentlyWatched(getRecentlyWatched());
  }, []);

  const fetchMovies = async () => {
    try {
      console.log('Fetching movies from Firebase...');
      const moviesCollection = collection(db, 'movies');
      const moviesQuery = query(moviesCollection, orderBy('uploadedAt', 'desc'));
      const movieSnapshot = await getDocs(moviesQuery);
      
      const movieList = movieSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Fetched movie:', { id: doc.id, ...data });
        
        // Transform Firebase data to match our AppMovie interface
        return {
          id: doc.id,
          title: data.title || 'Untitled',
          poster: data.poster || '/placeholder.svg',
          backdrop: data.poster || '/placeholder.svg', // Use poster as backdrop if no backdrop
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
      }) as AppMovie[];

      console.log('Total movies loaded:', movieList.length);
      console.log('Movies data:', movieList);
      setMovies(movieList);

      // Set featured movie (first movie marked as featured, or first movie if none)
      const featured = movieList.find(movie => movie.isFeatured) || movieList[0];
      setFeaturedMovie(featured || null);

      if (movieList.length === 0) {
        console.log('No movies found in database');
        toast({
          title: "No Movies Found",
          description: "Upload some movies from the admin dashboard to get started.",
        });
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast({
        title: "Error",
        description: "Failed to load movies from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = (movie: AppMovie | RecentlyWatchedMovie) => {
    // Convert RecentlyWatchedMovie to AppMovie if needed
    const fullMovie = movies.find(m => m.id === movie.id) || {
      ...movie,
      backdrop: movie.poster,
      description: 'No description available',
      videoUrl: '',
      releaseYear: movie.year,
      language: 'Unknown',
      isTrending: false,
      isFeatured: false,
      views: 0
    } as AppMovie;
    
    setSelectedMovie(fullMovie);
    setShowMovieDetail(true);
  };

  const handlePlayMovie = (movie: AppMovie | RecentlyWatchedMovie) => {
    // Convert RecentlyWatchedMovie to AppMovie if needed and add to recently watched
    const fullMovie = movies.find(m => m.id === movie.id) || {
      ...movie,
      backdrop: movie.poster,
      description: 'No description available',
      videoUrl: '',
      releaseYear: movie.year,
      language: 'Unknown',
      isTrending: false,
      isFeatured: false,
      views: 0
    } as AppMovie;

    // Add to recently watched (convert to the format expected by the service)
    const recentMovie = {
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      backdrop: movie.poster, // Add required backdrop property
      year: movie.year,
      genre: movie.genre,
      rating: movie.rating,
      duration: movie.duration,
      description: 'No description available' // Add required description property
    };
    addToRecentlyWatched(recentMovie);
    setRecentlyWatched(getRecentlyWatched());
    
    setSelectedMovie(fullMovie);
    setShowMovieDetail(false);
    setShowVideoPlayer(true);
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    await logout();
    setWatchlist([]);
  };

  const handleToggleWatchlist = (movieId: string) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }

    setWatchlist(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  // Group movies by categories
  const trendingMovies = movies.filter(movie => movie.isTrending);
  const actionMovies = movies.filter(movie => movie.genre.toLowerCase().includes('action'));
  const sciFiMovies = movies.filter(movie => movie.genre.toLowerCase().includes('sci-fi') || movie.genre.toLowerCase().includes('science'));
  const recentMovies = movies.slice(0, 10); // Most recent 10 movies
  const topRatedMovies = movies.filter(movie => movie.rating >= 8).sort((a, b) => b.rating - a.rating);

  if (showVideoPlayer && selectedMovie) {
    return (
      <VideoPlayer
        movie={selectedMovie}
        onBack={() => setShowVideoPlayer(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading movies...</div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation
          onSearch={() => setShowSearch(true)}
          onLogin={handleLogin}
          isLoggedIn={!!currentUser}
          onLogout={handleLogout}
          currentUser={userData ? { name: userData.name, email: userData.email } : undefined}
        />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">No Movies Available</h1>
            <p className="text-gray-400 mb-8">Upload some movies from the admin dashboard to get started.</p>
            {userData?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Go to Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <FocusProvider>
      <div className="min-h-screen bg-black text-white">
        <Navigation
          onSearch={() => setShowSearch(true)}
          onLogin={handleLogin}
          isLoggedIn={!!currentUser}
          onLogout={handleLogout}
          currentUser={userData ? { name: userData.name, email: userData.email } : undefined}
        />

        {/* Hero Section */}
        {featuredMovie && (
          <HeroSection
            featuredMovie={featuredMovie}
            onPlay={handlePlayMovie}
            onMoreInfo={handleMovieSelect}
            isInWatchlist={watchlist.includes(featuredMovie.id)}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {/* Movie Carousels */}
        <div className="relative -mt-32 z-10 space-y-8 pb-20">
          {/* Recently Watched - Only show if user has watched movies */}
          {recentlyWatched.length > 0 && (
            <MovieCarousel
              title="Recently Watched"
              movies={recentlyWatched}
              rowIndex={0}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}
          
          {/* Trending Movies */}
          {trendingMovies.length > 0 && (
            <MovieCarousel
              title="Trending Now"
              movies={trendingMovies}
              rowIndex={recentlyWatched.length > 0 ? 1 : 0}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}
          
          {/* Action Movies */}
          {actionMovies.length > 0 && (
            <MovieCarousel
              title="Action Movies"
              movies={actionMovies}
              rowIndex={recentlyWatched.length > 0 ? 2 : 1}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}
          
          {/* Sci-Fi Movies */}
          {sciFiMovies.length > 0 && (
            <MovieCarousel
              title="Sci-Fi Collection"
              movies={sciFiMovies}
              rowIndex={recentlyWatched.length > 0 ? 3 : 2}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}
          
          {/* Recent Movies */}
          <MovieCarousel
            title="Recently Added"
            movies={recentMovies}
            rowIndex={recentlyWatched.length > 0 ? 4 : 3}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
          
          {/* Top Rated Movies */}
          {topRatedMovies.length > 0 && (
            <MovieCarousel
              title="Top Rated"
              movies={topRatedMovies}
              rowIndex={recentlyWatched.length > 0 ? 5 : 4}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}

          {/* All Movies if no specific categories */}
          {trendingMovies.length === 0 && actionMovies.length === 0 && sciFiMovies.length === 0 && (
            <MovieCarousel
              title="All Movies"
              movies={movies}
              rowIndex={recentlyWatched.length > 0 ? 2 : 1}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
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

        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
          onRegister={() => navigate('/signup')}
        />
      </div>
    </FocusProvider>
  );
};

export default Index;
