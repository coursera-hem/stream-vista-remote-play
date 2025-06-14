
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Trash2, Plus, Video, Image as ImageIcon } from 'lucide-react';

export interface EpisodeFormData {
  episodeNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
}

interface EpisodeFormProps {
  episodes: EpisodeFormData[];
  onChange: (episodes: EpisodeFormData[]) => void;
}

export const EpisodeForm: React.FC<EpisodeFormProps> = ({
  episodes,
  onChange
}) => {
  const addEpisode = () => {
    const newEpisode: EpisodeFormData = {
      episodeNumber: episodes.length + 1,
      title: '',
      description: '',
      videoUrl: '',
      thumbnail: '',
      duration: ''
    };
    onChange([...episodes, newEpisode]);
  };

  const removeEpisode = (index: number) => {
    const updatedEpisodes = episodes.filter((_, i) => i !== index);
    // Renumber episodes
    const renumberedEpisodes = updatedEpisodes.map((episode, i) => ({
      ...episode,
      episodeNumber: i + 1
    }));
    onChange(renumberedEpisodes);
  };

  const updateEpisode = (index: number, field: keyof EpisodeFormData, value: string | number) => {
    const updatedEpisodes = episodes.map((episode, i) => 
      i === index ? { ...episode, [field]: value } : episode
    );
    onChange(updatedEpisodes);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-white text-lg">Episodes</Label>
        <Button
          type="button"
          onClick={addEpisode}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          Add Episode
        </Button>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
          <p className="text-gray-400 mb-4">No episodes added yet</p>
          <Button
            type="button"
            onClick={addEpisode}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:text-white hover:border-white"
          >
            <Plus size={16} className="mr-2" />
            Add First Episode
          </Button>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {episodes.map((episode, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Episode {episode.episodeNumber}</h4>
                <Button
                  type="button"
                  onClick={() => removeEpisode(index)}
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm">Episode Title *</Label>
                  <Input
                    value={episode.title}
                    onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                    placeholder="Enter episode title"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-sm">Duration</Label>
                  <Input
                    value={episode.duration}
                    onChange={(e) => updateEpisode(index, 'duration', e.target.value)}
                    placeholder="e.g., 24m"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-gray-300 text-sm">Description</Label>
                <Textarea
                  value={episode.description}
                  onChange={(e) => updateEpisode(index, 'description', e.target.value)}
                  placeholder="Enter episode description"
                  rows={2}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Video size={14} />
                    Video URL *
                  </Label>
                  <Input
                    value={episode.videoUrl}
                    onChange={(e) => updateEpisode(index, 'videoUrl', e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <ImageIcon size={14} />
                    Thumbnail URL
                  </Label>
                  <Input
                    value={episode.thumbnail}
                    onChange={(e) => updateEpisode(index, 'thumbnail', e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
