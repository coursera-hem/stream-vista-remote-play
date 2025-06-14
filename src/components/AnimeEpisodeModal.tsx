
import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Calendar } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Episode } from '../types/Episode';

interface AnimeEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeTitle: string;
  animeId: string;
  animePoster: string;
  onEpisodePlay: (episode: Episode) => void;
}

export const AnimeEpisodeModal: React.FC<AnimeEpisodeModalProps> = ({
  isOpen,
  onClose,
  animeTitle,
  animeId,
  animePoster,
  onEpisodePlay
}) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && animeId) {
      fetchEpisodes();
    }
  }, [isOpen, animeId]);

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      console.log('Fetching episodes for anime:', animeId);
      const episodesRef = collection(db, 'episodes');
      // Removed orderBy to avoid composite index requirement
      const q = query(
        episodesRef,
        where('animeId', '==', animeId)
      );
      const querySnapshot = await getDocs(q);
      
      const episodeList: Episode[] = [];
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('Episode data:', { id: doc.id, ...data });
        
        const episode: Episode = {
          id: doc.id,
          animeId: data.animeId,
          episodeNumber: data.episodeNumber,
          title: data.title,
          description: data.description || '',
          videoUrl: data.videoUrl,
          thumbnail: data.thumbnail,
          duration: data.duration,
          airDate: data.airDate ? data.airDate.toDate() : undefined,
          views: data.views || 0,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
        };
        
        episodeList.push(episode);
      });
      
      // Sort episodes by episode number on the client side
      episodeList.sort((a, b) => a.episodeNumber - b.episodeNumber);
      
      console.log('Total episodes fetched:', episodeList.length);
      setEpisodes(episodeList);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
              <p className="text-gray-400">
                {loading ? 'Loading...' : `${episodes.length} Episode${episodes.length !== 1 ? 's' : ''}`}
              </p>
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
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading episodes...</div>
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-medium mb-2">No Episodes Available</h4>
                <p className="text-gray-400 text-sm">
                  Episodes for this anime haven't been uploaded yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer group"
                  onClick={() => onEpisodePlay(episode)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-medium">
                          Episode {episode.episodeNumber}
                        </h4>
                        {episode.duration && (
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Clock size={12} />
                            <span>{episode.duration}</span>
                          </div>
                        )}
                      </div>
                      <h5 className="text-white text-sm font-medium mb-1">
                        {episode.title}
                      </h5>
                      {episode.description && (
                        <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                          {episode.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{episode.views} views</span>
                        {episode.airDate && (
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{new Date(episode.airDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {episode.thumbnail && (
                        <img 
                          src={episode.thumbnail} 
                          alt={`Episode ${episode.episodeNumber} thumbnail`}
                          className="w-24 h-14 object-cover rounded"
                        />
                      )}
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white rounded-full p-2 hover:bg-red-700">
                        <Play size={16} fill="white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
