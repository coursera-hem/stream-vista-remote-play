
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Upload, Link as LinkIcon } from 'lucide-react';

interface MovieData {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  duration: string;
  poster: string;
  videoUrl: string;
  uploadedAt: Date;
}

export const MovieUploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    releaseYear: new Date().getFullYear(),
    duration: '',
    driveLink: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const convertGoogleDriveLink = (driveUrl: string): string => {
    try {
      const fileIdMatch = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
      return driveUrl;
    } catch (error) {
      console.error('Error converting Google Drive link:', error);
      return driveUrl;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'releaseYear' ? parseInt(value) || new Date().getFullYear() : value
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `thumbnails/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.genre || !formData.duration || !formData.driveLink) {
        throw new Error('Please fill in all required fields');
      }

      if (!thumbnailFile) {
        throw new Error('Please select a thumbnail image');
      }

      // Upload thumbnail
      const thumbnailUrl = await uploadThumbnail(thumbnailFile);

      // Convert Google Drive link
      const convertedVideoUrl = convertGoogleDriveLink(formData.driveLink);

      // Prepare movie data
      const movieData: MovieData = {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        releaseYear: formData.releaseYear,
        duration: formData.duration,
        poster: thumbnailUrl,
        videoUrl: convertedVideoUrl,
        uploadedAt: new Date()
      };

      // Save to Firestore
      await addDoc(collection(db, 'movies'), movieData);

      setSuccess('Movie uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        genre: '',
        releaseYear: new Date().getFullYear(),
        duration: '',
        driveLink: ''
      });
      setThumbnailFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('thumbnail') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      setError(error.message || 'Failed to upload movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-6">
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 text-green-400 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-white">Movie Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Enter movie title"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Enter movie description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre" className="text-white">Genre *</Label>
              <Input
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                required
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="e.g., Action, Drama, Comedy"
              />
            </div>

            <div>
              <Label htmlFor="releaseYear" className="text-white">Release Year *</Label>
              <Input
                id="releaseYear"
                name="releaseYear"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 5}
                value={formData.releaseYear}
                onChange={handleInputChange}
                required
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration" className="text-white">Duration *</Label>
            <Input
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="e.g., 2h 30m"
            />
          </div>

          <div>
            <Label htmlFor="thumbnail" className="text-white">Thumbnail Image *</Label>
            <div className="mt-2">
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                required
                className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="driveLink" className="text-white flex items-center gap-2">
              <LinkIcon size={16} />
              Google Drive Video Link *
            </Label>
            <Input
              id="driveLink"
              name="driveLink"
              value={formData.driveLink}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
            />
            <p className="text-sm text-gray-400 mt-1">
              Paste the Google Drive share link. It will be automatically converted to a streamable URL.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Uploading...'
            ) : (
              <>
                <Upload size={20} />
                Upload Movie
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
