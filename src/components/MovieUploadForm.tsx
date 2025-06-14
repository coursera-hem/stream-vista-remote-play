
import React, { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Upload, Link as LinkIcon, Video, X, FileVideo, Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface MovieData {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  duration: string;
  poster: string;
  videoUrl: string;
  rating: number;
  language: string;
  isTrending: boolean;
  isFeatured: boolean;
  views: number;
  uploadedAt: Date;
}

export const MovieUploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action',
    releaseYear: new Date().getFullYear(),
    duration: '',
    driveLink: '',
    poster: '',
    rating: 8.0,
    language: 'English',
    isTrending: false,
    isFeatured: false
  });
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'drive' | 'upload'>('drive');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Adventure', 'Animation', 'Documentary'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Korean', 'Other'];

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

  const handleVideoUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a valid video file (MP4, AVI, MOV, WMV, MKV)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size should be less than 500MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a reference to the file in Firebase Storage
      const timestamp = Date.now();
      const fileName = `videos/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          toast({
            title: "Upload Error",
            description: "Failed to upload video file",
            variant: "destructive"
          });
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData(prev => ({
              ...prev,
              driveLink: downloadURL
            }));
            
            toast({
              title: "Success",
              description: "Video uploaded successfully"
            });
            setUploading(false);
            setUploadProgress(0);
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast({
              title: "Error",
              description: "Failed to get video URL",
              variant: "destructive"
            });
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to start upload",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      handleVideoUpload(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setUploadMethod('upload');
        handleVideoUpload(file);
      }
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.driveLink) {
      toast({
        title: "Error",
        description: "Please provide a video link or upload a video file",
        variant: "destructive"
      });
      return;
    }

    if (!formData.poster) {
      toast({
        title: "Error",
        description: "Please provide a poster image URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const videoUrl = uploadMethod === 'drive' ? convertGoogleDriveLink(formData.driveLink) : formData.driveLink;

      const movieData: Omit<MovieData, 'uploadedAt'> & { uploadedAt: any } = {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        releaseYear: formData.releaseYear,
        duration: formData.duration,
        poster: formData.poster,
        videoUrl: videoUrl,
        rating: formData.rating,
        language: formData.language,
        isTrending: formData.isTrending,
        isFeatured: formData.isFeatured,
        views: 0,
        uploadedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'movies'), movieData);

      toast({
        title: "Success",
        description: "Movie uploaded successfully!"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        genre: 'Action',
        releaseYear: new Date().getFullYear(),
        duration: '',
        driveLink: '',
        poster: '',
        rating: 8.0,
        language: 'English',
        isTrending: false,
        isFeatured: false
      });
      setVideoFile(null);
      setUploadMethod('drive');

    } catch (error: any) {
      console.error('Error uploading movie:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to upload movie',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-6">
        {loading && uploadProgress > 0 && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 text-blue-400 rounded">
            <div className="flex items-center justify-between mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
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
              placeholder="Enter movie description"
            />
          </div>

          {/* Poster URL */}
          <div>
            <Label htmlFor="poster" className="text-white">Poster Image URL *</Label>
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

          {/* Video Upload Method Selection */}
          <div>
            <Label className="text-white">Video Source *</Label>
            <div className="mt-2 flex gap-4">
              <button
                type="button"
                onClick={() => setUploadMethod('drive')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  uploadMethod === 'drive'
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <LinkIcon size={16} />
                <span>Google Drive Link</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  uploadMethod === 'upload'
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <FileVideo size={16} />
                <span>Upload Video</span>
              </button>
            </div>
          </div>

          {/* Google Drive Link or Video Upload */}
          {uploadMethod === 'drive' ? (
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
          ) : (
            <div>
              <Label className="text-white flex items-center gap-2">
                <Video size={16} />
                Upload Video *
              </Label>
              <div 
                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-red-500 bg-red-500/10' : 'border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <div className="space-y-4">
                    <FileVideo className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
                    <p className="text-gray-300">Uploading video...</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400">{uploadProgress}% complete</p>
                  </div>
                ) : formData.driveLink && videoFile ? (
                  <div className="space-y-2">
                    <FileVideo className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="text-green-400">Video uploaded successfully!</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, driveLink: '' }));
                        setVideoFile(null);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Upload different video
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-300 mb-2">Drop your video file here or click to browse</p>
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      Supported formats: MP4, AVI, MOV, WMV, MKV (Max: 500MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Genre, Year, Rating, Language */}
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
            disabled={loading || uploading}
            className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Adding Movie...'
            ) : uploading ? (
              'Uploading Video...'
            ) : (
              <>
                <Plus size={20} />
                Add Movie
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
