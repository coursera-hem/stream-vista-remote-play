
import React from 'react';
import { useFocus } from './FocusProvider';
import { Play, Plus, Check } from 'lucide-react';

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

interface MovieCardProps {
  movie: AppMovie;
  focusId: string;
  onSelect: (movie: AppMovie) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (movieId: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  focusId,
  onSelect,
  isInWatchlist = false,
  onToggleWatchlist
}) => {
  const { focusedElement } = useFocus();
  const isFocused = focusedElement === focusId;

  const handleClick = () => {
    onSelect(movie);
  };

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWatchlist?.(movie.id);
  };

  return (
    <div
      id={focusId}
      className={`
        group relative flex-shrink-0 w-72 h-40 rounded-lg overflow-hidden cursor-pointer
        transform transition-all duration-300 ease-in-out
        ${isFocused ? 'scale-110 ring-4 ring-red-500 z-10' : 'hover:scale-105'}
      `}
      onClick={handleClick}
    >
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-full object-cover"
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-semibold text-sm mb-1 truncate">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span>{movie.year}</span>
          <span>{movie.genre}</span>
          <span>⭐ {movie.rating}</span>
        </div>
      </div>

      {/* Action buttons - visible on focus/hover */}
      <div className={`
        absolute top-2 right-2 flex gap-2 transition-opacity duration-200
        ${isFocused || 'group-hover' ? 'opacity-100' : 'opacity-0'}
      `}>
        <button
          onClick={handleWatchlistToggle}
          className="w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
        >
          {isInWatchlist ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Plus className="w-4 h-4 text-white" />
          )}
        </button>
        <button className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
          <Play className="w-4 h-4 text-white ml-0.5" />
        </button>
      </div>
    </div>
  );
};
