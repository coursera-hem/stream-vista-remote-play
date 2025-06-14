import React, { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Upload, Link as LinkIcon, Video, FileVideo, Plus, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface AnimeData {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  episodes: number;
  status: string;
  poster: string;
  videoUrl: string;
  rating: number;
  language: string;
  isTrending: boolean;
  isFeatured: boolean;
  views: number;
  uploadedAt: Date;
  type: 'anime';
}

export const AnimeUploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action',
    releaseYear: new Date().getFullYear(),
    episodes: 1,
    status: 'Completed',
    driveLink: '',
    poster: '',
    rating: 8.0,
    language: 'Japanese',
    isTrending: false,
    isFeatured: false
  });
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'drive' | 'upload'>('drive');
  const [posterUploadMethod, setPosterUploadMethod] = useState<'url' | 'upload'>('url');
  const [dragActive, setDragActive] = useState(false);
  const [posterDragActive, setPosterDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posterUploading, setPosterUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [posterUploadProgress, setPosterUploadProgress] = useState(0);
  const { toast } = useToast();

  const animeGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];
  const animeStatus = ['Completed', 'Ongoing', 'Upcoming'];
  const languages = ['Japanese', 'English', 'Korean', 'Chinese', 'Other'];

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
    console.log('=== POSTER UPLOAD STARTED ===');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    if (!file) {
      console.error('No file provided');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      toast({
        title: "Error",
        description: "Please select a valid image file (JPEG, PNG, WebP)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
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
      console.log('Creating storage reference...');
      
      // Create unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `anime-posters/${timestamp}_${randomId}.${fileExtension}`;
      
      console.log('Storage path:', fileName);
      console.log('Storage instance:', storage);
      
      const storageRef = ref(storage, fileName);
      console.log('Storage reference created successfully');
      
      // Start upload
      console.log('Starting upload task...');
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
            console.log(`Bytes: ${snapshot.bytesTransferred}/${snapshot.totalBytes}`);
            console.log('Upload state:', snapshot.state);
            setPosterUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error('=== UPLOAD ERROR ===');
            console.error('Error object:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));
            
            setPosterUploading(false);
            setPosterUploadProgress(0);
            
            let errorMessage = 'Failed to upload poster image';
            switch (error.code) {
              case 'storage/unauthorized':
                errorMessage = 'Storage access denied. Please check Firebase permissions.';
                break;
              case 'storage/canceled':
                errorMessage = 'Upload was canceled.';
                break;
              case 'storage/unknown':
                errorMessage = 'Unknown storage error. Please try again.';
                break;
              case 'storage/retry-limit-exceeded':
                errorMessage = 'Upload failed after multiple retries. Please try again.';
                break;
              default:
                errorMessage = `Upload failed: ${error.message}`;
            }
            
            toast({
              title: "Upload Error",
              description: errorMessage,
              variant: "destructive"
            });
            
            reject(error);
          },
          async () => {
            try {
              console.log('=== UPLOAD COMPLETED ===');
              console.log('Getting download URL...');
              
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Download URL obtained:', downloadURL);
              
              setFormData(prev => ({
                ...prev,
                poster: downloadURL
              }));
              
              setPosterUploading(false);
              setPosterUploadProgress(0);
              
              console.log('Poster upload completed successfully');
              
              toast({
                title: "Success",
                description: "Poster image uploaded successfully!"
              });
              
              resolve();
            } catch (urlError) {
              console.error('Error getting download URL:', urlError);
              setPosterUploading(false);
              setPosterUploadProgress(0);
              
              toast({
                title: "Error",
                description: "Upload completed but failed to get image URL",
                variant: "destructive"
              });
              
              reject(urlError);
            }
          }
        );
      });

    } catch (error) {
      console.error('=== UPLOAD INITIALIZATION ERROR ===');
      console.error('Error:', error);
      
      setPosterUploading(false);
      setPosterUploadProgress(0);
      
      toast({
        title: "Error",
        description: "Failed to start poster upload. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a valid video file (MP4, AVI, MOV, WMV, MKV)",
        variant: "destructive"
      });
      return;
    }

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
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `anime-videos/${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

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

  const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Poster file selected from input:', file);
      setPosterFile(file);
      await handlePosterUpload(file);
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

  const handlePosterDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setPosterDragActive(true);
    } else if (e.type === "dragleave") {
      setPosterDragActive(false);
    }
  }, []);

  const handlePosterDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosterDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        console.log('Poster file dropped:', file);
        setPosterFile(file);
        setPosterUploadMethod('upload');
        await handlePosterUpload(file);
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
    
    console.log('Form submission started');
    console.log('Current form data:', formData);
    
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
        description: "Please provide a poster image URL or upload a poster image",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const videoUrl = uploadMethod === 'drive' ? convertGoogleDriveLink(formData.driveLink) : formData.driveLink;

      const animeData: Omit<AnimeData, 'uploadedAt'> & { uploadedAt: any } = {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        releaseYear: formData.releaseYear,
        episodes: formData.episodes,
        status: formData.status,
        poster: formData.poster,
        videoUrl: videoUrl,
        rating: formData.rating,
        language: formData.language,
        isTrending: formData.isTrending,
        isFeatured: formData.isFeatured,
        views: 0,
        type: 'anime',
        uploadedAt: serverTimestamp()
      };

      console.log('Saving anime data to database:', animeData);
      await addDoc(collection(db, 'animes'), animeData);

      toast({
        title: "Success",
        description: "Anime uploaded successfully!"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        genre: 'Action',
        releaseYear: new Date().getFullYear(),
        episodes: 1,
        status: 'Completed',
        driveLink: '',
        poster: '',
        rating: 8.0,
        language: 'Japanese',
        isTrending: false,
        isFeatured: false
      });
      setVideoFile(null);
      setPosterFile(null);
      setUploadMethod('drive');
      setPosterUploadMethod('url');

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-6">
        {/* Enhanced Debug Information */}
        <div className="mb-6 p-4 bg-gray-800 border border-gray-600 text-gray-300 rounded text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Firebase Storage:</strong> {storage ? '✅ Connected' : '❌ Not connected'}</p>
              <p><strong>Poster Uploading:</strong> {posterUploading ? '🔄 Yes' : '✅ No'}</p>
              <p><strong>Poster Progress:</strong> {posterUploadProgress}%</p>
            </div>
            <div>
              <p><strong>Video Uploading:</strong> {uploading ? '🔄 Yes' : '✅ No'}</p>
              <p><strong>Video Progress:</strong> {uploadProgress}%</p>
              <p><strong>Form Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</p>
            </div>
          </div>
          <div className="mt-2">
            <p><strong>Poster URL:</strong> {formData.poster ? '✅ Set' : '❌ Empty'}</p>
            {formData.poster && <p className="break-all text-green-400">{formData.poster}</p>}
          </div>
        </div>

        {/* Progress Indicators */}
        {(uploading && uploadProgress > 0) || (posterUploading && posterUploadProgress >= 0) && (
          <div className="mb-6 space-y-4">
            {uploading && uploadProgress > 0 && (
              <div className="p-4 bg-blue-500/20 border border-blue-500 text-blue-400 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span>Uploading Video...</span>
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
            {posterUploading && (
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
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="https://example.com/anime-poster.jpg"
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
                    <p className="text-gray-300">Uploading poster... {posterUploadProgress}%</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 max-w-xs mx-auto">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${posterUploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : formData.poster ? (
                  <div className="space-y-2">
                    <img 
                      src={formData.poster} 
                      alt="Poster preview" 
                      className="w-32 h-48 object-cover mx-auto rounded-lg"
                    />
                    <p className="text-green-400">✅ Poster uploaded successfully!</p>
                    <p className="text-xs text-gray-400 break-all">{formData.poster}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-300 mb-2">Drop your poster image here or click to browse</p>
                      <Input
                        id="poster-file"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePosterChange}
                        className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                  </div>
                ) : formData.driveLink && videoFile ? (
                  <div className="space-y-2">
                    <FileVideo className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="text-green-400">Video uploaded successfully!</p>
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Genre, Year, Episodes, Status */}
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
                {animeGenres.map(genre => (
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
              <Label htmlFor="episodes" className="text-white">Episodes *</Label>
              <Input
                id="episodes"
                name="episodes"
                type="number"
                min="1"
                value={formData.episodes}
                onChange={handleInputChange}
                required
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-white">Status *</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {animeStatus.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
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
            disabled={loading || uploading || posterUploading}
            className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Adding Anime...'
            ) : uploading ? (
              'Uploading Video...'
            ) : posterUploading ? (
              'Uploading Poster...'
            ) : (
              <>
                <Plus size={20} />
                Add Anime
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
