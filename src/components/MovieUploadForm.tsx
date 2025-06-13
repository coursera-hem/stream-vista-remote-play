import React, { useState, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Upload, Link as LinkIcon, Video, X } from 'lucide-react';

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'drive' | 'upload'>('drive');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
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
      }
    }
  }, []);

  const uploadThumbnail = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `thumbnails/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const uploadVideo = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `videos/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    // For large video files, you might want to implement progress tracking
    setUploadProgress(50); // Simulated progress
    await uploadBytes(storageRef, file);
    setUploadProgress(100);
    
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setUploadProgress(0);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.genre || !formData.duration) {
        throw new Error('Please fill in all required fields');
      }

      if (!thumbnailFile) {
        throw new Error('Please select a thumbnail image');
      }

      // Validate video source
      if (uploadMethod === 'drive' && !formData.driveLink) {
        throw new Error('Please provide a Google Drive link');
      }

      if (uploadMethod === 'upload' && !videoFile) {
        throw new Error('Please select a video file to upload');
      }

      // Upload thumbnail
      setUploadProgress(20);
      const thumbnailUrl = await uploadThumbnail(thumbnailFile);

      // Handle video URL
      let videoUrl: string;
      if (uploadMethod === 'drive') {
        videoUrl = convertGoogleDriveLink(formData.driveLink);
        setUploadProgress(80);
      } else {
        setUploadProgress(40);
        videoUrl = await uploadVideo(videoFile!);
      }

      // Prepare movie data
      const movieData: MovieData = {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        releaseYear: formData.releaseYear,
        duration: formData.duration,
        poster: thumbnailUrl,
        videoUrl: videoUrl,
        uploadedAt: new Date()
      };

      // Save to Firestore
      setUploadProgress(90);
      await addDoc(collection(db, 'movies'), movieData);
      setUploadProgress(100);

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
      setVideoFile(null);
      
      // Reset file inputs
      const thumbnailInput = document.getElementById('thumbnail') as HTMLInputElement;
      const videoInput = document.getElementById('video') as HTMLInputElement;
      if (thumbnailInput) thumbnailInput.value = '';
      if (videoInput) videoInput.value = '';

    } catch (error: any) {
      setError(error.message || 'Failed to upload movie');
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
              ></div>
            </div>
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

          {/* Video Upload Method Selection */}
          <div>
            <Label className="text-white">Video Source *</Label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="drive"
                  checked={uploadMethod === 'drive'}
                  onChange={(e) => setUploadMethod(e.target.value as 'drive' | 'upload')}
                  className="accent-red-600"
                />
                <span className="text-white">Google Drive Link</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="upload"
                  checked={uploadMethod === 'upload'}
                  onChange={(e) => setUploadMethod(e.target.value as 'drive' | 'upload')}
                  className="accent-red-600"
                />
                <span className="text-white">Upload Video</span>
              </label>
            </div>
          </div>

          {/* Google Drive Link */}
          {uploadMethod === 'drive' && (
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
          )}

          {/* Video Upload */}
          {uploadMethod === 'upload' && (
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
                {videoFile ? (
                  <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-400" />
                      <span className="text-white truncate">{videoFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Drag and drop your video file here</p>
                    <p className="text-gray-400 text-sm mb-4">or</p>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Supported formats: MP4, MOV, AVI, WMV (Max: 2GB)
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

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
