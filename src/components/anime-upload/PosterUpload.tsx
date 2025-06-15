
import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { usePosterUpload } from './hooks/usePosterUpload';

interface PosterUploadProps {
  posterUrl: string;
  onPosterChange: (url: string) => void;
  uploadMethod: 'url' | 'upload';
  onUploadMethodChange: (method: 'url' | 'upload') => void;
}

export const PosterUpload: React.FC<PosterUploadProps> = ({
  posterUrl,
  onPosterChange,
  uploadMethod,
  onUploadMethodChange
}) => {
  const {
    posterFile,
    setPosterFile,
    posterUploading,
    posterUploadProgress,
    posterDragActive,
    handlePosterUpload,
    handlePosterDrag,
    handlePosterDrop
  } = usePosterUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterFile(file);
      const url = await handlePosterUpload(file);
      if (url) onPosterChange(url);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPosterChange(e.target.value);
  };

  return (
    <div>
      <Label className="text-white">Poster Image *</Label>
      <div className="mt-2 flex gap-4">
        <button
          type="button"
          onClick={() => onUploadMethodChange('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            uploadMethod === 'url'
              ? 'bg-red-600 border-red-600 text-white'
              : 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'
          }`}
        >
          <LinkIcon size={16} />
          <span>Image URL</span>
        </button>
        <button
          type="button"
          onClick={() => onUploadMethodChange('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            uploadMethod === 'upload'
              ? 'bg-red-600 border-red-600 text-white'
              : 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'
          }`}
        >
          <ImageIcon size={16} />
          <span>Upload Image</span>
        </button>
      </div>

      {uploadMethod === 'url' ? (
        <div className="mt-4">
          <Label htmlFor="poster" className="text-white flex items-center gap-2">
            <LinkIcon size={16} />
            Poster Image URL *
          </Label>
          <Input
            id="poster"
            name="poster"
            type="url"
            value={posterUrl}
            onChange={handleInputChange}
            required
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="https://example.com/poster.jpg"
          />
        </div>
      ) : (
        <div className="mt-4">
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
            onDrop={(e) => handlePosterDrop(e, onPosterChange)}
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
            ) : posterUrl && posterFile ? (
              <div className="space-y-2">
                <img 
                  src={posterUrl} 
                  alt="Poster preview" 
                  className="w-32 h-48 object-cover mx-auto rounded-lg"
                />
                <p className="text-green-400">Poster uploaded successfully!</p>
                <button
                  type="button"
                  onClick={() => {
                    onPosterChange('');
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
                    onChange={handleFileChange}
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
    </div>
  );
};
