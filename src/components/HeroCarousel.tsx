
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Info, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AppMovie {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
  description?: string;
  videoUrl?: string;
  releaseYear?: number;
  language?: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  views?: number;
}

interface HeroCarouselProps {
  featuredItems: AppMovie[];
  onPlay: (movie: AppMovie) => void;
  onMoreInfo: (movie: AppMovie) => void;
  watchlist: string[];
  onToggleWatchlist?: (movieId: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  featuredItems,
  onPlay,
  onMoreInfo,
  watchlist,
  onToggleWatchlist
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Auto-slide every 8 seconds
  useEffect(() => {
    if (featuredItems.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredItems.length, currentIndex]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(currentIndex === 0 ? featuredItems.length - 1 : currentIndex - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(currentIndex === featuredItems.length - 1 ? 0 : currentIndex + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePlayClick = (movie: AppMovie) => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    onPlay(movie);
  };

  if (featuredItems.length === 0) return null;

  const currentMovie = featuredItems[currentIndex];

  return (
    <div className="relative h-screen flex items-center overflow-hidden">
      {/* Sliding background container */}
      <div 
        className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${featuredItems.length * 100}%`
        }}
      >
        {featuredItems.map((item, index) => (
          <div
            key={item.id}
            className="w-full h-full bg-cover bg-center flex-shrink-0"
            style={{ 
              backgroundImage: `url(${item.backdrop || item.poster})`,
              width: `${100 / featuredItems.length}%`
            }}
          />
        ))}
      </div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      
      {/* Navigation arrows */}
      {featuredItems.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      
      {/* Content with slide animation */}
      <div className="relative z-10 max-w-2xl px-8 text-white">
        <div 
          key={currentIndex}
          className="animate-fade-in"
        >
          <h1 className="text-6xl font-bold mb-4 leading-tight">
            {currentMovie.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-6 text-lg">
            <span className="bg-red-600 px-3 py-1 rounded text-sm font-semibold">
              {currentMovie.year}
            </span>
            <span>{currentMovie.genre}</span>
            <span>⭐ {currentMovie.rating}</span>
            <span>{currentMovie.duration}</span>
          </div>
          
          <p className="text-xl mb-8 leading-relaxed opacity-90 line-clamp-3">
            {currentMovie.description || 'No description available'}
          </p>
          
          {/* Action buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => handlePlayClick(currentMovie)}
              className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              <Play className="w-6 h-6 fill-current" />
              {currentUser ? 'Play' : 'Sign In to Play'}
            </button>
            
            <button
              onClick={() => onMoreInfo(currentMovie)}
              className="flex items-center gap-3 bg-gray-600/80 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors"
            >
              <Info className="w-6 h-6" />
              More Info
            </button>
            
            <button
              onClick={() => onToggleWatchlist?.(currentMovie.id)}
              className="flex items-center justify-center w-14 h-14 bg-gray-600/80 text-white rounded-full hover:bg-gray-600 transition-colors"
            >
              {watchlist.includes(currentMovie.id) ? (
                <Check className="w-6 h-6 text-green-400" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Slide indicators */}
        {featuredItems.length > 1 && (
          <div className="flex gap-2">
            {featuredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-colors disabled:cursor-not-allowed ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
