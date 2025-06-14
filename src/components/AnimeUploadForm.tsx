
import React, { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Upload, Link as LinkIcon, Image as ImageIcon, Plus, ArrowRight } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { EpisodeManager } from './EpisodeManager';

interface AnimeData {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  poster: string;
  status: string;
  rating: number;
  language: string;
  isTrending: boolean;
  isFeatured: boolean;
  views: number;
  uploadedAt: Date;
}

export const AnimeUploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action',
    releaseYear: new Date().getFullYear(),
    poster: '',
    status: 'Ongoing',
    rating: 8.0,
    language: 'Japanese',
    isTrending: false,
    isFeatured: false
  });
  
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUploadMethod, setPosterUploadMethod] = useState<'url' | 'upload'>('url');
  const [posterDragActive, setPosterDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posterUploading, setPosterUploading] = useState(false);
  const [posterUploadProgress, setPosterUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'details' | 'episodes'>('details');
  const [createdAnimeId, setCreatedAnimeId] = useState<string | null>(null);
  const { toast } = useToast();

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Adventure', 'Animation', 'Fantasy'];
  const languages = ['Japanese', 'English', 'Korean', 'Chinese', 'Other'];
  const statuses = ['Ongoing', 'Completed', 'Coming Soon'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handlePosterUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a valid image file (JPEG, PNG, WebP)",
        variant: "destructive"
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setPosterUploading(true);
    setPosterUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `anime-posters/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setPosterUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Poster upload error:', error);
          toast({
            title: "Upload Error",
            description: "Failed to upload poster image",
            variant: "destructive"
          });
          setPosterUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData(prev => ({
              ...prev,
              poster: downloadURL
            }));
            
            toast({
              title: "Success",
              description: "Poster image uploaded successfully"
            });
            setPosterUploading(false);
            setPosterUploadProgress(0);
          } catch (error) {
            console.error('Error getting poster download URL:', error);
            toast({
              title: "Error",
              description: "Failed to get poster image URL",
              variant: "destructive"
            });
            setPosterUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Poster upload error:', error);
      toast({
        title: "Error",
        description: "Failed to start poster upload",
        variant: "destructive"
      });
      setPosterUploading(false);
    }
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterFile(file);
      handlePosterUpload(file);
    }
  };

  const handlePosterDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setPosterDragActive(true);
    } else if (e.type === "dragleave") {
      setPosterDragActive(false);
    }
  }, []);

  const handlePosterDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosterDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setPosterFile(file);
        setPosterUploadMethod('upload');
        handlePosterUpload(file);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.poster) {
      toast({
        title: "Error",
        description: "Please provide a poster image URL or upload a poster image",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const animeData: Omit<AnimeData, 'uploadedAt'> & { uploadedAt: any } = {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        releaseYear: formData.releaseYear,
        poster: formData.poster,
        status: formData.status,
        rating: formData.rating,
        language: formData.language,
        isTrending: formData.isTrending,
        isFeatured: formData.isFeatured,
        views: 0,
        uploadedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'anime'), animeData);
      setCreatedAnimeId(docRef.id);

      toast({
        title: "Success",
        description: "Anime details saved successfully! Now you can add episodes."
      });

      setCurrentStep('episodes');

    } catch (error: any) {
      console.error('Error uploading anime:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to upload anime',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: 'Action',
      releaseYear: new Date().getFullYear(),
      poster: '',
      status: 'Ongoing',
      rating: 8.0,
      language: 'Japanese',
      isTrending: false,
      isFeatured: false
    });
    setPosterFile(null);
    setPosterUploadMethod('url');
    setCurrentStep('details');
    setCreatedAnimeId(null);
  };

  // Show episode management step
  if (currentStep === 'episodes' && createdAnimeId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Add Episodes</h2>
              <p className="text-gray-400">Add episodes to {formData.title}</p>
            </div>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Add Another Anime
            </Button>
          </div>
          
          <EpisodeManager
            animeId={createdAnimeId}
            animeTitle={formData.title}
            onBack={resetForm}
          />
        </div>
      </div>
    );
  }

  // Show anime details form
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Add New Anime</h2>
          <p className="text-gray-400">Step 1: Enter anime details, then you can add episodes</p>
        </div>

        {posterUploading && posterUploadProgress > 0 && (
          <div className="mb-6">
            <div className="p-4 bg-green-500/20 border border-green-500 text-green-400 rounded">
              <div className="flex items-center justify-between mb-2">
                <span>Uploading Poster...</span>
                <span>{posterUploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${posterUploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-white">Anime Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Enter anime title"
            />
          </div>

          {/* Description */}
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
              placeholder="Enter anime description"
            />
          </div>

          {/* Poster Upload Method Selection */}
          <div>
            <Label className="text-white">Poster Image *</Label>
            <div className="mt-2 flex gap-4">
              <button
                type="button"
                onClick={() => setPosterUploadMethod('url')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  posterUploadMethod === 'url'
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <LinkIcon size={16} />
                <span>Image URL</span>
              </button>
              <button
                type="button"
                onClick={() => setPosterUploadMethod('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  posterUploadMethod === 'upload'
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <ImageIcon size={16} />
                <span>Upload Image</span>
              </button>
            </div>
          </div>

          {/* Poster URL or Upload */}
          {posterUploadMethod === 'url' ? (
            <div>
              <Label htmlFor="poster" className="text-white flex items-center gap-2">
                <LinkIcon size={16} />
                Poster Image URL *
              </Label>
              <Input
                id="poster"
                name="poster"
                type="url"
                value={formData.poster}
                onChange={handleInputChange}
                required
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="https://example.com/poster.jpg"
              />
            </div>
          ) : (
            <div>
              <Label className="text-white flex items-center gap-2">
                <ImageIcon size={16} />
                Upload Poster Image *
              </Label>
              <div 
                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  posterDragActive ? 'border-red-500 bg-red-500/10' : 'border-gray-600'
                }`}
                onDragEnter={handlePosterDrag}
                onDragLeave={handlePosterDrag}
                onDragOver={handlePosterDrag}
                onDrop={handlePosterDrop}
              >
                {posterUploading ? (
                  <div className="space-y-4">
                    <ImageIcon className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
                    <p className="text-gray-300">Uploading poster...</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${posterUploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400">{posterUploadProgress}% complete</p>
                  </div>
                ) : formData.poster && posterFile ? (
                  <div className="space-y-2">
                    <img 
                      src={formData.poster} 
                      alt="Poster preview" 
                      className="w-32 h-48 object-cover mx-auto rounded-lg"
                    />
                    <p className="text-green-400">Poster uploaded successfully!</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, poster: '' }));
                        setPosterFile(null);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Upload different image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-300 mb-2">Drop your poster image here or click to browse</p>
                      <Input
                        id="poster-file"
                        type="file"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      Supported formats: JPEG, PNG, WebP (Max: 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Genre, Year, Rating, Language, Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre" className="text-white">Genre *</Label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
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

            <div>
              <Label htmlFor="rating" className="text-white">Rating (1-10)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="language" className="text-white">Language</Label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="status" className="text-white">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Flags */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="trending"
                checked={formData.isTrending}
                onChange={(e) => handleCheckboxChange('isTrending', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="trending" className="text-white">
                Mark as Trending
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.isFeatured}
                onChange={(e) => handleCheckboxChange('isFeatured', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="featured" className="text-white">
                Mark as Featured (Hero Section)
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || posterUploading}
            className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Saving Anime...'
            ) : posterUploading ? (
              'Uploading Poster...'
            ) : (
              <>
                <ArrowRight size={20} />
                Save & Add Episodes
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
