
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface FirebaseMovie {
  id: string;
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  duration: string;
  poster: string;
  videoUrl: string;
  uploadedAt: Date;
}

interface MovieManagerProps {
  onBack: () => void;
}

export const MovieManager: React.FC<MovieManagerProps> = ({ onBack }) => {
  const [movies, setMovies] = useState<FirebaseMovie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const moviesCollection = collection(db, 'movies');
      const movieSnapshot = await getDocs(moviesCollection);
      const movieList = movieSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseMovie[];
      setMovies(movieList);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch movies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = (movieId: string) => {
    setSelectedMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMovies.length === movies.length) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(movies.map(movie => movie.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMovies.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedMovies.length} movie(s)?`
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedMovies.map(movieId => deleteDoc(doc(db, 'movies', movieId)))
      );
      
      toast({
        title: "Success",
        description: `${selectedMovies.length} movie(s) deleted successfully`
      });
      
      setSelectedMovies([]);
      await fetchMovies();
    } catch (error) {
      console.error('Error deleting movies:', error);
      toast({
        title: "Error",
        description: "Failed to delete movies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white">Loading movies...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-white">Manage Movies</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleSelectAll}
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            {selectedMovies.length === movies.length ? 'Deselect All' : 'Select All'}
          </Button>
          {selectedMovies.length > 0 && (
            <Button
              onClick={handleDeleteSelected}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedMovies.length})
            </Button>
          )}
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">No movies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedMovies.includes(movie.id) ? 'ring-2 ring-red-500' : ''
              }`}
              onClick={() => handleSelectMovie(movie.id)}
            >
              <div className="relative">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedMovies.includes(movie.id)}
                    onChange={() => handleSelectMovie(movie.id)}
                    className="w-4 h-4 accent-red-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold truncate">{movie.title}</h3>
                <p className="text-gray-400 text-sm">{movie.genre} • {movie.releaseYear}</p>
                <p className="text-gray-400 text-sm">{movie.duration}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
