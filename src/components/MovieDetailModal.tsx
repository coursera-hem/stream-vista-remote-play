
import React, { useEffect } from 'react';
import { X, Play, Plus, Check, Star } from 'lucide-react';
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

interface MovieDetailModalProps {
  movie: AppMovie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (movie: AppMovie) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (movieId: string) => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  isOpen,
  onClose,
  onPlay,
  isInWatchlist = false,
  onToggleWatchlist
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handlePlayClick = () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    onPlay(movie!);
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-48 h-72 object-cover rounded-lg mx-auto lg:mx-0"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-300">
                <span className="bg-red-600 px-3 py-1 rounded text-sm font-semibold text-white">
                  {movie.year}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {movie.rating}
                </span>
                <span>{movie.duration}</span>
                <span className="px-3 py-1 border border-gray-600 rounded text-sm">
                  {movie.genre}
                </span>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {movie.description || 'No description available'}
              </p>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handlePlayClick}
                  className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {currentUser ? 'Play' : 'Sign In to Play'}
                </button>
                
                <button
                  onClick={() => onToggleWatchlist?.(movie.id)}
                  className="flex items-center gap-3 bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  {isInWatchlist ? (
                    <>
                      <Check className="w-5 h-5 text-green-400" />
                      In mylist
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add to mylist
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
