
import React from 'react';
import { Play, Info, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useFocus } from './FocusProvider';

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
  const { focusedElement } = useFocus();

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
      <div className="relative z-10 max-w-2xl px-8 text-white">
        <h1 className="text-6xl font-bold mb-4 leading-tight">
          {featuredMovie.title}
        </h1>
        
        <div className="flex items-center gap-4 mb-6 text-lg">
          <span className="bg-red-600 px-3 py-1 rounded text-sm font-semibold">
            {featuredMovie.year}
          </span>
          <span>{featuredMovie.genre}</span>
          <span>⭐ {featuredMovie.rating}</span>
          <span>{featuredMovie.duration}</span>
        </div>
        
        <p className="text-xl mb-8 leading-relaxed opacity-90">
          {featuredMovie.description || 'No description available'}
        </p>
        
        {/* Action buttons with keyboard navigation support */}
        <div className="flex gap-4">
          <button
            id="hero-play-0"
            onClick={handlePlayClick}
            className={`flex items-center gap-3 bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors ${
              focusedElement === 'hero-play-0' ? 'ring-4 ring-white ring-opacity-70' : ''
            }`}
          >
            <Play className="w-6 h-6 fill-current" />
            {currentUser ? 'Play' : 'Sign In to Play'}
          </button>
          
          <button
            id="hero-info-0"
            onClick={() => onMoreInfo(featuredMovie)}
            className={`flex items-center gap-3 bg-gray-600/80 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors ${
              focusedElement === 'hero-info-0' ? 'ring-4 ring-white ring-opacity-70' : ''
            }`}
          >
            <Info className="w-6 h-6" />
            More Info
          </button>
          
          <button
            id="hero-watchlist-0"
            onClick={() => onToggleWatchlist?.(featuredMovie.id)}
            className={`flex items-center justify-center w-14 h-14 bg-gray-600/80 text-white rounded-full hover:bg-gray-600 transition-colors ${
              focusedElement === 'hero-watchlist-0' ? 'ring-4 ring-white ring-opacity-70' : ''
            }`}
          >
            {isInWatchlist ? (
              <Check className="w-6 h-6 text-green-400" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
