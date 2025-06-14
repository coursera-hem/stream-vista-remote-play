
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Episode } from '../types/Episode';

interface Series {
  id: string;
  title: string;
  description: string;
  poster: string;
  genre: string;
  releaseYear: number;
  language: string;
  type: 'series';
  totalEpisodes?: number;
  status: 'ongoing' | 'completed';
}

interface SeriesModalProps {
  series: Series | null;
  onClose: () => void;
}

export const SeriesModal: React.FC<SeriesModalProps> = ({ series, onClose }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  // Fetch episodes for selected series
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!series) {
        setEpisodes([]);
        return;
      }

      try {
        console.log('Fetching episodes for series:', series.id);
        
        // Try both seriesId and animeId fields to handle different episode storage formats
        const episodesQuery = query(
          collection(db, 'episodes'),
          or(
            where('seriesId', '==', series.id),
            where('animeId', '==', series.id)
          )
        );
        
        const querySnapshot = await getDocs(episodesQuery);
        console.log('Episodes query results:', querySnapshot.docs.length);
        
        const episodesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Episode data:', { id: doc.id, ...data });
          return {
            id: doc.id,
            ...data
          };
        }) as Episode[];
        
        console.log('Total episodes fetched:', episodesData.length);
        setEpisodes(episodesData.sort((a, b) => a.episodeNumber - b.episodeNumber));
      } catch (error) {
        console.error('Error fetching episodes:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          selectedSeriesId: series.id
        });
        
        // Fallback: try a simpler query if the compound query fails
        try {
          console.log('Trying fallback query with seriesId only...');
          const fallbackQuery = query(
            collection(db, 'episodes'),
            where('seriesId', '==', series.id)
          );
          const fallbackSnapshot = await getDocs(fallbackQuery);
          console.log('Fallback query results:', fallbackSnapshot.docs.length);
          
          if (fallbackSnapshot.docs.length === 0) {
            console.log('Trying fallback query with animeId...');
            const animeQuery = query(
              collection(db, 'episodes'),
              where('animeId', '==', series.id)
            );
            const animeSnapshot = await getDocs(animeQuery);
            console.log('AnimeId query results:', animeSnapshot.docs.length);
            
            const episodesData = animeSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Episode[];
            
            setEpisodes(episodesData.sort((a, b) => a.episodeNumber - b.episodeNumber));
          } else {
            const episodesData = fallbackSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Episode[];
            
            setEpisodes(episodesData.sort((a, b) => a.episodeNumber - b.episodeNumber));
          }
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
        }
      }
    };

    fetchEpisodes();
  }, [series]);

  if (!series) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-white">{series.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          
          <p className="text-gray-300 mb-4">{series.description}</p>
          
          <div className="space-y-2 mb-6">
            <p className="text-gray-400">
              <span className="text-white font-semibold">Genre:</span> {series.genre}
            </p>
            <p className="text-gray-400">
              <span className="text-white font-semibold">Year:</span> {series.releaseYear}
            </p>
            <p className="text-gray-400">
              <span className="text-white font-semibold">Language:</span> {series.language}
            </p>
            <p className="text-gray-400">
              <span className="text-white font-semibold">Status:</span> {series.status}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Episodes</h3>
            {episodes.length === 0 ? (
              <p className="text-gray-400">No episodes available yet.</p>
            ) : (
              <div className="space-y-2">
                {episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-semibold">
                          Episode {episode.episodeNumber}: {episode.title}
                        </h4>
                        <p className="text-gray-400 text-sm mt-1">{episode.description}</p>
                        <p className="text-gray-500 text-xs mt-2">Duration: {episode.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
