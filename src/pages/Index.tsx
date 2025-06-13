
import React, { useState } from 'react';
import { FocusProvider } from '../components/FocusProvider';
import { Navigation } from '../components/Navigation';
import { HeroSection } from '../components/HeroSection';
import { MovieCarousel } from '../components/MovieCarousel';
import { SearchModal } from '../components/SearchModal';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { LoginModal } from '../components/LoginModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { mockMovies, movieCategories, Movie } from '../data/mockMovies';

const Index = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | undefined>();
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const featuredMovie = mockMovies[0];

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowMovieDetail(true);
  };

  const handlePlayMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowMovieDetail(false);
    setShowVideoPlayer(true);
  };

  const handleLogin = (email: string, password: string) => {
    setIsLoggedIn(true);
    setCurrentUser({ name: 'John Doe', email });
    console.log('Login:', { email, password });
  };

  const handleRegister = (name: string, email: string, password: string) => {
    setIsLoggedIn(true);
    setCurrentUser({ name, email });
    console.log('Register:', { name, email, password });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(undefined);
    setWatchlist([]);
  };

  const handleToggleWatchlist = (movieId: string) => {
    if (!isLoggedIn) {
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
          onLogin={() => setShowLogin(true)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          currentUser={currentUser}
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
          <MovieCarousel
            title="Trending Now"
            movies={movieCategories.trending}
            rowIndex={0}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
          
          <MovieCarousel
            title="Action Movies"
            movies={movieCategories.action}
            rowIndex={1}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
          
          <MovieCarousel
            title="Sci-Fi Collection"
            movies={movieCategories.sciFi}
            rowIndex={2}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
          
          <MovieCarousel
            title="Recently Added"
            movies={movieCategories.recent}
            rowIndex={3}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
          
          <MovieCarousel
            title="Top Rated"
            movies={movieCategories.topRated}
            rowIndex={4}
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
          onRegister={handleRegister}
        />
      </div>
    </FocusProvider>
  );
};

export default Index;
