
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Upload, Video, Image as ImageIcon, Plus, Save } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { CreateEpisodeData } from '../types/Episode';

interface EpisodeUploadFormProps {
  animeId: string;
  animeTitle: string;
  onEpisodeAdded: () => void;
  onComplete?: () => void;
}

export const EpisodeUploadForm: React.FC<EpisodeUploadFormProps> = ({
  animeId,
  animeTitle,
  onEpisodeAdded,
  onComplete
}) => {
  const [formData, setFormData] = useState({
    episodeNumber: 1,
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    duration: ''
  });
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoUploadMethod, setVideoUploadMethod] = useState<'file' | 'drive'>('file');
  const [thumbnailUploadMethod, setThumbnailUploadMethod] = useState<'file' | 'url'>('file');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
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

    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `episodes/${animeId}/${timestamp}_${sanitizedFileName}`;
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
              videoUrl: downloadURL
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

  const handleThumbnailUpload = async (file: File) => {
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

    setThumbnailUploading(true);
    setThumbnailProgress(0);

    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `episode-thumbnails/${animeId}/${timestamp}_${randomId}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setThumbnailProgress(Math.round(progress));
        },
        (error) => {
          console.error('Thumbnail upload error:', error);
          toast({
            title: "Upload Error",
            description: "Failed to upload thumbnail",
            variant: "destructive"
          });
          setThumbnailUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData(prev => ({
              ...prev,
              thumbnail: downloadURL
            }));
            
            toast({
              title: "Success",
              description: "Thumbnail uploaded successfully"
            });
            setThumbnailUploading(false);
            setThumbnailProgress(0);
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast({
              title: "Error",
              description: "Failed to get thumbnail URL",
              variant: "destructive"
            });
            setThumbnailUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      toast({
        title: "Error",
        description: "Failed to start thumbnail upload",
        variant: "destructive"
      });
      setThumbnailUploading(false);
    }
  };

  const checkEpisodeExists = async (episodeNumber: number): Promise<boolean> => {
    const episodesRef = collection(db, 'episodes');
    const q = query(
      episodesRef,
      where('animeId', '==', animeId),
      where('episodeNumber', '==', episodeNumber)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.videoUrl) {
      toast({
        title: "Error",
        description: "Please provide a video file or Google Drive link",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an episode title",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if episode number already exists
      const episodeExists = await checkEpisodeExists(formData.episodeNumber);
      if (episodeExists) {
        toast({
          title: "Error",
          description: `Episode ${formData.episodeNumber} already exists for this anime`,
          variant: "destructive"
        });
        return;
      }

      const episodeData: Omit<CreateEpisodeData, 'animeId'> & { 
        animeId: string;
        views: number;
        createdAt: any;
        updatedAt: any;
      } = {
        animeId,
        episodeNumber: formData.episodeNumber,
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        thumbnail: formData.thumbnail,
        duration: formData.duration,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'episodes'), episodeData);

      toast({
        title: "Success",
        description: "Episode added successfully!"
      });

      // Reset form
      setFormData({
        episodeNumber: formData.episodeNumber + 1,
        title: '',
        description: '',
        videoUrl: '',
        thumbnail: '',
        duration: ''
      });
      setVideoFile(null);
      setThumbnailFile(null);
      
      onEpisodeAdded();

    } catch (error: any) {
      console.error('Error adding episode:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to add episode',
        variant: "destructive"
      });
    }
  };

  const handleSaveAndComplete = () => {
    toast({
      title: "Success",
      description: "Episodes upload completed!"
    });
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        Add Episode to {animeTitle}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="episodeNumber" className="text-white">Episode Number *</Label>
            <Input
              id="episodeNumber"
              name="episodeNumber"
              type="number"
              min="1"
              value={formData.episodeNumber}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="duration" className="text-white">Duration (optional)</Label>
            <Input
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g., 24m"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="title" className="text-white">Episode Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="Enter episode title"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-white">Episode Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="Enter episode description"
          />
        </div>

        {/* Video Upload Method Selection */}
        <div>
          <Label className="text-white">Episode Video *</Label>
          <div className="mt-2 flex gap-4">
            <button
              type="button"
              onClick={() => setVideoUploadMethod('file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                videoUploadMethod === 'file'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'
              }`}
            >
              <Upload size={16} />
              <span>Choose File</span>
            </button>
            <button
              type="button"
              onClick={() => setVideoUploadMethod('drive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                videoUploadMethod === 'drive'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'
              }`}
            >
              <Video size={16} />
              <span>Google Drive Link</span>
            </button>
          </div>
        </div>

        {/* Video Upload/Link */}
        {videoUploadMethod === 'file' ? (
          <div>
            <Label className="text-white flex items-center gap-2">
              <Video size={16} />
              Upload Episode Video *
            </Label>
            <div className="mt-2 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              {uploading ? (
                <div className="space-y-4">
                  <Video className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
                  <p className="text-gray-300">Uploading video... {uploadProgress}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 max-w-xs mx-auto">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : formData.videoUrl ? (
                <div className="space-y-2">
                  <Video className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-green-400">✅ Video uploaded successfully!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-300 mb-2">Drop your video file here or click to browse</p>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setVideoFile(file);
                          handleVideoUpload(file);
                        }
                      }}
                      className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="videoUrl" className="text-white flex items-center gap-2">
              <Video size={16} />
              Google Drive Link *
            </Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="https://drive.google.com/file/d/..."
            />
          </div>
        )}

        {/* Thumbnail Upload Method Selection */}
        <div>
          <Label className="text-white">Episode Thumbnail (optional)</Label>
          <div className="mt-2 flex gap-4">
            <button
              type="button"
              onClick={() => setThumbnailUploadMethod('file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                thumbnailUploadMethod === 'file'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-500'
              }`}
            >
              <Upload size={16} />
              <span>Choose File</span>
            </button>
            <button
              type="button"
              onClick={() => setThumbnailUploadMethod('url')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                thumbnailUploadMethod === 'url'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-500'
              }`}
            >
              <ImageIcon size={16} />
              <span>Image Link</span>
            </button>
          </div>
        </div>

        {/* Thumbnail Upload/Link */}
        {thumbnailUploadMethod === 'file' ? (
          <div>
            <Label className="text-white flex items-center gap-2">
              <ImageIcon size={16} />
              Upload Episode Thumbnail
            </Label>
            <div className="mt-2 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              {thumbnailUploading ? (
                <div className="space-y-4">
                  <ImageIcon className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
                  <p className="text-gray-300">Uploading thumbnail... {thumbnailProgress}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 max-w-xs mx-auto">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${thumbnailProgress}%` }}
                    />
                  </div>
                </div>
              ) : formData.thumbnail ? (
                <div className="space-y-2">
                  <img 
                    src={formData.thumbnail} 
                    alt="Episode thumbnail" 
                    className="w-32 h-20 object-cover mx-auto rounded"
                  />
                  <p className="text-green-400">✅ Thumbnail uploaded!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-300 mb-2">Drop thumbnail here or click to browse</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setThumbnailFile(file);
                          handleThumbnailUpload(file);
                        }
                      }}
                      className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="thumbnail" className="text-white flex items-center gap-2">
              <ImageIcon size={16} />
              Thumbnail Image URL
            </Label>
            <Input
              id="thumbnail"
              name="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={handleInputChange}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>
        )}

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={uploading || thumbnailUploading || !formData.videoUrl}
            className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Episode
          </Button>

          <Button
            type="button"
            onClick={handleSaveAndComplete}
            variant="outline"
            className="w-full border-gray-600 text-white hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save and Complete
          </Button>
        </div>
      </form>
    </div>
  );
};
