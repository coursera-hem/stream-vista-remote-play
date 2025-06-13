
import React, { useState, useEffect } from 'react';
import { FocusProvider } from '../components/FocusProvider';
import { Navigation } from '../components/Navigation';
import { HeroSection } from '../components/HeroSection';
import { MovieCarousel } from '../components/MovieCarousel';
import { SearchModal } from '../components/SearchModal';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { LoginModal } from '../components/LoginModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { mockMovies, movieCategories, Movie } from '../data/mockMovies';
import { useAuth } from '../contexts/AuthContext';
import { addToRecentlyWatched, getRecentlyWatched } from '../services/recentlyWatched';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<Movie[]>([]);

  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load recently watched movies
    setRecentlyWatched(getRecentlyWatched());
  }, []);

  const featuredMovie = mockMovies[0];

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowMovieDetail(true);
  };

  const handlePlayMovie = (movie: Movie) => {
    // Add to recently watched
    addToRecentlyWatched(movie);
    setRecentlyWatched(getRecentlyWatched());
    
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

  if (showVideoPlayer && selectedMovie) {
    return (
      <VideoPlayer
        movie={selectedMovie}
        onBack={() => setShowVideoPlayer(false)}
      />
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
        <HeroSection
          featuredMovie={featuredMovie}
          onPlay={handlePlayMovie}
          onMoreInfo={handleMovieSelect}
          isInWatchlist={watchlist.includes(featuredMovie.id)}
          onToggleWatchlist={handleToggleWatchlist}
        />

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
          
          <MovieCarousel
            title="Trending Now"
            movies={movieCategories.trending}
            rowIndex={recentlyWatched.length > 0 ? 1 : 0}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
          
          <MovieCarousel
            title="Action Movies"
            movies={movieCategories.action}
            rowIndex={recentlyWatched.length > 0 ? 2 : 1}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
          
          <MovieCarousel
            title="Sci-Fi Collection"
            movies={movieCategories.sciFi}
            rowIndex={recentlyWatched.length > 0 ? 3 : 2}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
          
          <MovieCarousel
            title="Recently Added"
            movies={movieCategories.recent}
            rowIndex={recentlyWatched.length > 0 ? 4 : 3}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
          
          <MovieCarousel
            title="Top Rated"
            movies={movieCategories.topRated}
            rowIndex={recentlyWatched.length > 0 ? 5 : 4}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
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
