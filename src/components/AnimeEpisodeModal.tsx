
import React from 'react';
import { X, Play } from 'lucide-react';

interface Episode {
  number: number;
  title?: string;
}

interface AnimeEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeTitle: string;
  totalEpisodes: number;
  animePoster: string;
  onEpisodePlay: (episodeNumber: number) => void;
}

export const AnimeEpisodeModal: React.FC<AnimeEpisodeModalProps> = ({
  isOpen,
  onClose,
  animeTitle,
  totalEpisodes,
  animePoster,
  onEpisodePlay
}) => {
  if (!isOpen) return null;

  // Generate episodes array in ascending order (1 to totalEpisodes)
  const episodes: Episode[] = Array.from({ length: totalEpisodes }, (_, index) => ({
    number: index + 1,
    title: `Episode ${index + 1}`
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <img
              src={animePoster}
              alt={animeTitle}
              className="w-16 h-20 object-cover rounded"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{animeTitle}</h2>
              <p className="text-gray-400">{totalEpisodes} Episodes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Episodes List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <h3 className="text-xl font-semibold text-white mb-4">Episodes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes.map((episode) => (
              <div
                key={episode.number}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer group"
                onClick={() => onEpisodePlay(episode.number)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Episode {episode.number}</h4>
                    <p className="text-gray-400 text-sm">{episode.title}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white rounded-full p-2 hover:bg-red-700">
                    <Play size={16} fill="white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
