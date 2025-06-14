
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(false);

  // Fetch episodes for selected series
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!series) {
        setEpisodes([]);
        return;
      }

      setLoading(true);
      console.log('=== FETCHING EPISODES FOR SERIES ===');
      console.log('Series ID:', series.id);
      console.log('Series Title:', series.title);

      try {
        // First, let's check what episodes exist in the database
        console.log('Step 1: Checking all episodes in database...');
        const allEpisodesQuery = query(collection(db, 'episodes'));
        const allEpisodesSnapshot = await getDocs(allEpisodesQuery);
        console.log('Total episodes in database:', allEpisodesSnapshot.docs.length);
        
        allEpisodesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('Episode found:', {
            id: doc.id,
            seriesId: data.seriesId,
            animeId: data.animeId,
            title: data.title,
            episodeNumber: data.episodeNumber
          });
        });

        // Try multiple query strategies
        let episodesData: Episode[] = [];

        // Strategy 1: Query by seriesId
        console.log('Step 2: Querying by seriesId =', series.id);
        const seriesQuery = query(
          collection(db, 'episodes'),
          where('seriesId', '==', series.id)
        );
        const seriesSnapshot = await getDocs(seriesQuery);
        console.log('Episodes found with seriesId query:', seriesSnapshot.docs.length);
        
        if (seriesSnapshot.docs.length > 0) {
          episodesData = seriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Episode[];
        } else {
          // Strategy 2: Query by animeId (in case series are stored as anime)
          console.log('Step 3: Querying by animeId =', series.id);
          const animeQuery = query(
            collection(db, 'episodes'),
            where('animeId', '==', series.id)
          );
          const animeSnapshot = await getDocs(animeQuery);
          console.log('Episodes found with animeId query:', animeSnapshot.docs.length);
          
          if (animeSnapshot.docs.length > 0) {
            episodesData = animeSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Episode[];
          } else {
            // Strategy 3: Try searching by series title (as a last resort)
            console.log('Step 4: No episodes found with ID queries, checking if any episodes reference this series by title...');
            const titleMatchEpisodes = allEpisodesSnapshot.docs.filter(doc => {
              const data = doc.data();
              return data.seriesTitle === series.title || data.animeTitle === series.title;
            });
            
            if (titleMatchEpisodes.length > 0) {
              console.log('Episodes found by title match:', titleMatchEpisodes.length);
              episodesData = titleMatchEpisodes.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Episode[];
            }
          }
        }

        console.log('Final episodes data:', episodesData);
        setEpisodes(episodesData.sort((a, b) => a.episodeNumber - b.episodeNumber));
      } catch (error) {
        console.error('Error fetching episodes:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          selectedSeriesId: series.id
        });
      } finally {
        setLoading(false);
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
            <p className="text-gray-400">
              <span className="text-white font-semibold">Series ID:</span> {series.id}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Episodes</h3>
            {loading ? (
              <p className="text-gray-400">Loading episodes...</p>
            ) : episodes.length === 0 ? (
              <div className="text-gray-400">
                <p>No episodes available yet.</p>
                <p className="text-sm mt-2">Debug info: Check console for detailed episode search results.</p>
              </div>
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
