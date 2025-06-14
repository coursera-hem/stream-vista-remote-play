import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Episode } from '../types/Episode';
import { VideoPlayer } from './VideoPlayer';
import { Play } from 'lucide-react';

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
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

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
        let episodesData: Episode[] = [];

        // Get all episodes from database first
        console.log('Fetching all episodes from database...');
        const allEpisodesQuery = query(collection(db, 'episodes'));
        const allEpisodesSnapshot = await getDocs(allEpisodesQuery);
        console.log('Total episodes in database:', allEpisodesSnapshot.docs.length);
        
        // Log all episodes with their IDs for debugging
        const allEpisodes = allEpisodesSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Episode found:', {
            id: doc.id,
            seriesId: data.seriesId,
            animeId: data.animeId,
            title: data.title,
            episodeNumber: data.episodeNumber
          });
          return {
            id: doc.id,
            ...data
          } as Episode;
        });

        // Strategy 1: Direct seriesId match
        console.log('Strategy 1: Looking for episodes with seriesId =', series.id);
        const seriesIdMatches = allEpisodes.filter(episode => episode.seriesId === series.id);
        console.log('Episodes found with seriesId match:', seriesIdMatches.length);
        
        if (seriesIdMatches.length > 0) {
          episodesData = seriesIdMatches;
        }

        // Strategy 2: Direct animeId match (episodes uploaded as anime but are actually series)
        if (episodesData.length === 0) {
          console.log('Strategy 2: Looking for episodes with animeId =', series.id);
          const animeIdMatches = allEpisodes.filter(episode => episode.animeId === series.id);
          console.log('Episodes found with animeId match:', animeIdMatches.length);
          
          if (animeIdMatches.length > 0) {
            episodesData = animeIdMatches;
          }
        }

        // Strategy 3: Title-based matching (fuzzy matching)
        if (episodesData.length === 0) {
          console.log('Strategy 3: Looking for episodes by title similarity...');
          console.log('Searching for episodes that might match series title:', series.title);
          
          // Check if any episodes reference this series by title or other means
          const titleMatches = allEpisodes.filter(episode => {
            const seriesTitle = series.title.toLowerCase().trim();
            const episodeTitle = (episode.title || '').toLowerCase().trim();
            
            // Check for title similarity or if episode title contains series title
            const titleMatch = episodeTitle.includes(seriesTitle) || seriesTitle.includes(episodeTitle);
            
            console.log('Checking episode:', {
              episodeTitle: episode.title,
              seriesTitle: series.title,
              titleMatch
            });
            
            return titleMatch;
          });
          
          console.log('Episodes found with title matching:', titleMatches.length);
          if (titleMatches.length > 0) {
            episodesData = titleMatches;
          }
        }

        // Strategy 4: Show available episodes and series info for debugging
        if (episodesData.length === 0) {
          console.log('=== NO EPISODES FOUND - DEBUGGING INFO ===');
          console.log('Current series details:', {
            id: series.id,
            title: series.title,
            type: series.type
          });
          
          console.log('Available episodes in database:');
          allEpisodes.forEach(episode => {
            console.log(' - Episode:', {
              id: episode.id,
              title: episode.title,
              seriesId: episode.seriesId,
              animeId: episode.animeId,
              episodeNumber: episode.episodeNumber
            });
          });
          
          console.log('=== POTENTIAL MATCHES ===');
          console.log('Episodes with any animeId:', allEpisodes.filter(ep => ep.animeId).length);
          console.log('Episodes with any seriesId:', allEpisodes.filter(ep => ep.seriesId).length);
        }

        console.log('Final episodes data count:', episodesData.length);
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

  const handleEpisodePlay = (episode: Episode) => {
    // Convert episode to movie format for VideoPlayer
    const movieFormat = {
      id: episode.id,
      title: `${series?.title} - Episode ${episode.episodeNumber}: ${episode.title}`,
      poster: episode.thumbnail || series?.poster || '',
      year: series?.releaseYear || new Date().getFullYear(),
      genre: series?.genre || 'Series',
      rating: 0,
      duration: episode.duration || 'Unknown',
      videoUrl: episode.videoUrl
    };
    setSelectedEpisode(episode);
  };

  const handleVideoPlayerBack = () => {
    setSelectedEpisode(null);
  };

  // Show VideoPlayer if an episode is selected
  if (selectedEpisode) {
    const movieFormat = {
      id: selectedEpisode.id,
      title: `${series?.title} - Episode ${selectedEpisode.episodeNumber}: ${selectedEpisode.title}`,
      poster: selectedEpisode.thumbnail || series?.poster || '',
      year: series?.releaseYear || new Date().getFullYear(),
      genre: series?.genre || 'Series',
      rating: 0,
      duration: selectedEpisode.duration || 'Unknown',
      videoUrl: selectedEpisode.videoUrl
    };

    return <VideoPlayer movie={movieFormat} onBack={handleVideoPlayerBack} />;
  }

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
                <p>No episodes found for this series.</p>
                <p className="text-sm mt-2">
                  <strong>Debugging Help:</strong>
                </p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• Check the console logs for detailed search results</li>
                  <li>• Episodes uploaded through anime section are stored with 'animeId'</li>
                  <li>• Episodes uploaded through series section are stored with 'seriesId'</li>
                  <li>• The episode search tries to match by ID and title</li>
                </ul>
                <p className="text-xs mt-2 text-yellow-400">
                  Open browser dev tools (F12) and check the console for detailed episode matching information.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">
                          Episode {episode.episodeNumber}: {episode.title}
                        </h4>
                        <p className="text-gray-400 text-sm mt-1">{episode.description}</p>
                        <p className="text-gray-500 text-xs mt-2">Duration: {episode.duration}</p>
                        <p className="text-gray-500 text-xs">
                          Source: {episode.seriesId ? 'Series Upload' : episode.animeId ? 'Anime Upload' : 'Unknown'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEpisodePlay(episode)}
                        className="ml-4 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors opacity-80 group-hover:opacity-100"
                        title="Play Episode"
                      >
                        <Play className="w-5 h-5 text-white fill-white" />
                      </button>
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
