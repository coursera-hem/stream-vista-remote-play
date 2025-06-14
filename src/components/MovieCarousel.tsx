
import React, { useRef } from 'react';
import { MovieCard } from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface MovieCarouselProps {
  title: string;
  movies: AppMovie[];
  rowIndex: number;
  onMovieSelect: (movie: AppMovie) => void;
  watchlist?: string[];
  onToggleWatchlist?: (movieId: string) => void;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  movies,
  rowIndex,
  onMovieSelect,
  watchlist = [],
  onToggleWatchlist
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 200 : window.innerWidth < 1024 ? 300 : 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-8 sm:mb-10 lg:mb-12 mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-4 sm:mb-6 px-4 sm:px-6 lg:px-8 xl:px-12">{title}</h2>
      
      <div className="relative group">
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </button>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </button>

        {/* Movie cards container */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 lg:gap-6 xl:gap-8 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 xl:px-12 pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {movies.map((movie, index) => (
            <div key={movie.id} style={{ scrollSnapAlign: 'start' }} className="flex-shrink-0">
              <MovieCard
                movie={movie}
                focusId={`home-${rowIndex}-${index}`}
                onSelect={onMovieSelect}
                isInWatchlist={watchlist.includes(movie.id)}
                onToggleWatchlist={onToggleWatchlist}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
