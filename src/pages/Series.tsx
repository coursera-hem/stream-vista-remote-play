
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { collection, query, getDocs, where, or } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { Episode } from '../types/Episode';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Play, Calendar, Star } from 'lucide-react';

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

const Series = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Fetch series from Firestore
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        console.log('Fetching series from Firestore...');
        console.log('Database instance:', db);
        
        // Query the series collection directly (not movies collection)
        const seriesQuery = query(collection(db, 'series'));
        const querySnapshot = await getDocs(seriesQuery);
        console.log('Series query results:', querySnapshot.docs.length);
        
        const seriesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Series data:', {
            id: doc.id,
            ...data
          });
          return {
            id: doc.id,
            ...data
          };
        }) as Series[];
        
        console.log('Total series fetched:', seriesData.length);
        setSeries(seriesData);
        
        // Also try checking the movies collection for series with type 'series'
        console.log('Also checking movies collection for series...');
        const moviesQuery = query(collection(db, 'movies'));
        const moviesSnapshot = await getDocs(moviesQuery);
        console.log('Total documents in movies collection:', moviesSnapshot.docs.length);
        
        const seriesInMovies = moviesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((item: any) => item.type === 'series') as Series[];
        
        console.log('Series found in movies collection:', seriesInMovies.length);
        
        // Combine series from both collections
        const allSeries = [...seriesData, ...seriesInMovies];
        setSeries(allSeries);
        
      } catch (error) {
        console.error('Error fetching series:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  // Fetch episodes for selected series
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedSeries) {
        setEpisodes([]);
        return;
      }

      try {
        console.log('Fetching episodes for series:', selectedSeries.id);
        
        // Try both seriesId and animeId fields to handle different episode storage formats
        const episodesQuery = query(
          collection(db, 'episodes'),
          or(
            where('seriesId', '==', selectedSeries.id),
            where('animeId', '==', selectedSeries.id)
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
          selectedSeriesId: selectedSeries.id
        });
        
        // Fallback: try a simpler query if the compound query fails
        try {
          console.log('Trying fallback query with seriesId only...');
          const fallbackQuery = query(
            collection(db, 'episodes'),
            where('seriesId', '==', selectedSeries.id)
          );
          const fallbackSnapshot = await getDocs(fallbackQuery);
          console.log('Fallback query results:', fallbackSnapshot.docs.length);
          
          if (fallbackSnapshot.docs.length === 0) {
            console.log('Trying fallback query with animeId...');
            const animeQuery = query(
              collection(db, 'episodes'),
              where('animeId', '==', selectedSeries.id)
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
  }, [selectedSeries]);

  const handleSeriesSelect = (seriesItem: Series) => {
    setSelectedSeries(seriesItem);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading series...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        onLogout={handleLogout}
        isLoggedIn={!!currentUser}
        onLogin={handleLogin}
      />

      <div className="pl-6 pr-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 pt-6">Series</h1>
          
          {series.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl">No series available yet.</p>
              <p className="text-gray-500 text-sm mt-2">Check console for debugging information.</p>
              <p className="text-gray-500 text-sm mt-1">
                Checked both 'series' and 'movies' collections for series data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {series.map((seriesItem) => (
                <Card
                  key={seriesItem.id}
                  className="group cursor-pointer bg-gray-900 border-gray-800 hover:border-red-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
                  onClick={() => handleSeriesSelect(seriesItem)}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="aspect-[2/3] bg-gray-800">
                      <img
                        src={seriesItem.poster}
                        alt={seriesItem.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/300x450/1f2937/ffffff?text=${encodeURIComponent(seriesItem.title)}`;
                        }}
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <Badge 
                      className={`absolute top-3 right-3 ${
                        seriesItem.status === 'completed' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {seriesItem.status}
                    </Badge>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="text-white font-bold text-lg group-hover:text-red-400 transition-colors line-clamp-2">
                        {seriesItem.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{seriesItem.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{seriesItem.releaseYear}</span>
                      </div>
                      {seriesItem.totalEpisodes && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{seriesItem.totalEpisodes} episodes</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {seriesItem.genre}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedSeries && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-white">{selectedSeries.title}</h2>
                    <button
                      onClick={() => setSelectedSeries(null)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{selectedSeries.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">Genre:</span> {selectedSeries.genre}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">Year:</span> {selectedSeries.releaseYear}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">Language:</span> {selectedSeries.language}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">Status:</span> {selectedSeries.status}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Series;
