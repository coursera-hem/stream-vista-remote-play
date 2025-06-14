
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface Anime {
  id: string;
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  episodes: number;
  status: string;
  poster: string;
  videoUrl: string;
}

interface AnimeEditFormProps {
  anime: Anime;
  onSave: () => void;
  onCancel: () => void;
}

export const AnimeEditForm: React.FC<AnimeEditFormProps> = ({
  anime,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: anime.title,
    description: anime.description,
    genre: anime.genre,
    releaseYear: anime.releaseYear,
    episodes: anime.episodes,
    status: anime.status,
    poster: anime.poster,
    videoUrl: anime.videoUrl
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const animeRef = doc(db, 'animes', anime.id);
      await updateDoc(animeRef, formData);
      
      toast({
        title: "Success",
        description: "Anime updated successfully"
      });
      
      onSave();
    } catch (error) {
      console.error('Error updating anime:', error);
      toast({
        title: "Error",
        description: "Failed to update anime",
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
        <h2 className="text-2xl font-bold text-white">Edit Anime</h2>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="episodes" className="text-white">Total Episodes</Label>
            <Input
              id="episodes"
              type="number"
              value={formData.episodes}
              onChange={(e) => setFormData({ ...formData, episodes: parseInt(e.target.value) })}
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="status" className="text-white">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md"
              required
            >
              <option value="Completed">Completed</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>
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
          <Label htmlFor="videoUrl" className="text-white">Trailer URL</Label>
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
