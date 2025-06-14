
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  duration: string;
  poster: string;
  videoUrl: string;
}

interface MovieEditFormProps {
  movie: Movie;
  onSave: () => void;
  onCancel: () => void;
}

export const MovieEditForm: React.FC<MovieEditFormProps> = ({
  movie,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: movie.title,
    description: movie.description,
    genre: movie.genre,
    releaseYear: movie.releaseYear,
    duration: movie.duration,
    poster: movie.poster,
    videoUrl: movie.videoUrl
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const movieRef = doc(db, 'movies', movie.id);
      await updateDoc(movieRef, formData);
      
      toast({
        title: "Success",
        description: "Movie updated successfully"
      });
      
      onSave();
    } catch (error) {
      console.error('Error updating movie:', error);
      toast({
        title: "Error",
        description: "Failed to update movie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="border-gray-600 text-white hover:bg-gray-800"
        >
          <ArrowLeft size={16} className="mr-2" />
          Cancel
        </Button>
        <h2 className="text-2xl font-bold text-white">Edit Movie</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-white">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="genre" className="text-white">Genre</Label>
            <Input
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="releaseYear" className="text-white">Release Year</Label>
            <Input
              id="releaseYear"
              type="number"
              value={formData.releaseYear}
              onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="duration" className="text-white">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="e.g., 120 min"
            required
          />
        </div>

        <div>
          <Label htmlFor="poster" className="text-white">Poster URL</Label>
          <Input
            id="poster"
            value={formData.poster}
            onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="videoUrl" className="text-white">Video URL</Label>
          <Input
            id="videoUrl"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
