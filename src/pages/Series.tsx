
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { SeriesGrid } from '../components/SeriesGrid';
import { SeriesModal } from '../components/SeriesModal';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    const { logout } = useAuth();
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

  const handleSeriesSelect = (seriesItem: Series) => {
    setSelectedSeries(seriesItem);
  };

  const handleCloseModal = () => {
    setSelectedSeries(null);
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
          
          <SeriesGrid series={series} onSeriesSelect={handleSeriesSelect} />

          <SeriesModal series={selectedSeries} onClose={handleCloseModal} />
        </div>
      </div>
    </div>
  );
};

export default Series;
