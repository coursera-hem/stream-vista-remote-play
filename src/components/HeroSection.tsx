
import React from 'react';
import { Play, Info, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  description?: string;
  videoUrl?: string;
  releaseYear?: number;
  language?: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  views?: number;
}

interface HeroSectionProps {
  featuredMovie: AppMovie;
  onPlay: (movie: AppMovie) => void;
  onMoreInfo: (movie: AppMovie) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (movieId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredMovie,
  onPlay,
  onMoreInfo,
  isInWatchlist = false,
  onToggleWatchlist
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlayClick = () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    onPlay(featuredMovie);
  };

  return (
    <div 
      className="relative h-screen flex items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${featuredMovie.backdrop || featuredMovie.poster})` }}
    >
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6 md:px-8 text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
          {featuredMovie.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base md:text-lg">
          <span className="bg-red-600 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold">
            {featuredMovie.year}
          </span>
          <span className="truncate">{featuredMovie.genre}</span>
          <span>⭐ {featuredMovie.rating}</span>
          <span className="hidden sm:inline">{featuredMovie.duration}</span>
        </div>
        
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-7 md:mb-8 leading-relaxed opacity-90 line-clamp-3 sm:line-clamp-none">
          {featuredMovie.description || 'No description available'}
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handlePlayClick}
            className="flex items-center justify-center gap-2 sm:gap-3 bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            <span className="sm:hidden">{currentUser ? 'Play' : 'Sign In'}</span>
            <span className="hidden sm:inline">{currentUser ? 'Play' : 'Sign In to Play'}</span>
          </button>
          
          <button
            onClick={() => onMoreInfo(featuredMovie)}
            className="flex items-center justify-center gap-2 sm:gap-3 bg-gray-600/80 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
          >
            <Info className="w-5 h-5 sm:w-6 sm:h-6" />
            More Info
          </button>
          
          <button
            onClick={() => onToggleWatchlist?.(featuredMovie.id)}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-600/80 text-white rounded-full hover:bg-gray-600 transition-colors mx-auto sm:mx-0"
          >
            {isInWatchlist ? (
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            ) : (
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
