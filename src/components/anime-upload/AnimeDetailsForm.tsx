
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ArrowRight } from 'lucide-react';
import { PosterUpload } from './PosterUpload';
import { AnimeFormData, GENRES, LANGUAGES, STATUSES } from './AnimeUploadTypes';

interface AnimeDetailsFormProps {
  formData: AnimeFormData;
  onFormDataChange: (data: Partial<AnimeFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  posterUploading: boolean;
  posterUploadMethod: 'url' | 'upload';
  onPosterUploadMethodChange: (method: 'url' | 'upload') => void;
}

export const AnimeDetailsForm: React.FC<AnimeDetailsFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  loading,
  posterUploading,
  posterUploadMethod,
  onPosterUploadMethodChange
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    onFormDataChange({
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onFormDataChange({ [field]: checked });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Add New Anime</h2>
          <p className="text-gray-400">Step 1: Enter anime details, then you can add episodes</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
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

          {/* Poster Upload */}
          <PosterUpload
            posterUrl={formData.poster}
            onPosterChange={(url) => onFormDataChange({ poster: url })}
            uploadMethod={posterUploadMethod}
            onUploadMethodChange={onPosterUploadMethodChange}
          />

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
                {GENRES.map(genre => (
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
                {LANGUAGES.map(lang => (
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
                {STATUSES.map(status => (
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
