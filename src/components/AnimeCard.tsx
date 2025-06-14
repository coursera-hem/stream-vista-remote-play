
import React, { useState } from 'react';
import { Play, Star, Calendar, Tv } from 'lucide-react';

interface AnimeCardProps {
  id: string;
  title: string;
  poster: string;
  genre: string;
  releaseYear: number;
  episodes: number;
  status: string;
  rating: number;
  description: string;
  onPlay?: () => void;
  onEpisodeSelect?: (episodeNumber: number) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  title,
  poster,
  genre,
  releaseYear,
  episodes,
  status,
  rating,
  description,
  onPlay,
  onEpisodeSelect
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    console.log('Image failed to load for anime:', title);
    console.log('Image URL:', poster);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully for anime:', title);
    setImageLoaded(true);
  };

  const handleCardClick = () => {
    // When card is clicked, trigger episode selection with episode 1 as default
    if (onEpisodeSelect) {
      onEpisodeSelect(1);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when play button is clicked
    if (onPlay) {
      onPlay();
    }
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        {imageError ? (
          <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <div className="text-sm mb-2">Image not available</div>
              <div className="text-xs text-gray-400 break-all">{poster}</div>
            </div>
          </div>
        ) : (
          <img
            src={poster}
            alt={title}
            className="w-full h-64 object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
        
        {/* Loading indicator */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
            <div className="text-white text-sm">Loading...</div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-600 text-white rounded-full p-3 hover:bg-red-700"
          >
            <Play size={24} fill="white" />
          </button>
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          {status}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 truncate">{title}</h3>
        <div className="flex items-center gap-4 text-gray-400 text-sm mb-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500" fill="currentColor" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{releaseYear}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tv size={14} />
            <span>{episodes === 0 ? 'No episodes' : `${episodes} ep`}</span>
          </div>
        </div>
        <p className="text-red-500 text-sm mb-2">{genre}</p>
        <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
      </div>
    </div>
  );
};
