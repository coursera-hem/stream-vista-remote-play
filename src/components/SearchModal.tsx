
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { MovieCard } from './MovieCard';

interface Movie {
  id: string;
  title: string;
  poster: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieSelect: (movie: Movie) => void;
  movies: Movie[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onMovieSelect,
  movies
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies([]);
    }
  }, [searchTerm, movies]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-gray-700">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Search movies, genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-800 text-white text-xl rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
            autoFocus
          />
        </div>
        
        <button
          onClick={onClose}
          className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {searchTerm.trim() === '' ? (
          <div className="text-center text-gray-400 mt-20">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">Start typing to search for movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-xl">No movies found for "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                focusId={`search-0-${index}`}
                onSelect={(movie) => {
                  onMovieSelect(movie);
                  onClose();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
