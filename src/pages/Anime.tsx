
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Sidebar } from '../components/Sidebar';
import { SearchModal } from '../components/SearchModal';
import { LoginModal } from '../components/LoginModal';
import { AnimeCard } from '../components/AnimeCard';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FirebaseAnime {
  id: string;
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  episodes: number;
  status: string;
  poster: string;
  videoUrl: string;
  rating: number;
  language: string;
  isTrending: boolean;
  isFeatured: boolean;
  views: number;
}

const Anime = () => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [animes, setAnimes] = useState<FirebaseAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    try {
      console.log('Fetching animes from Firebase...');
      const animesCollection = collection(db, 'animes');
      const animeSnapshot = await getDocs(animesCollection);
      const animeList = animeSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Anime data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      }) as FirebaseAnime[];
      
      console.log('Total animes fetched:', animeList.length);
      setAnimes(animeList);
    } catch (error) {
      console.error('Error fetching animes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAnimePlay = (anime: FirebaseAnime) => {
    console.log('Playing anime:', anime.title);
    // You can implement video player modal here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Sidebar
          onLogout={handleLogout}
          isLoggedIn={!!currentUser}
          onLogin={() => setShowLoginModal(true)}
        />

        <main className="pt-16 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-white text-xl">Loading anime collection...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        onLogout={handleLogout}
        isLoggedIn={!!currentUser}
        onLogin={() => setShowLoginModal(true)}
      />

      <main className="pt-16 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Anime Collection</h1>
          
          {animes.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold mb-4">No Anime Available</h2>
                <p className="text-gray-400 mb-6">
                  There are no anime uploaded yet. Check back later for new content!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {animes.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  title={anime.title}
                  poster={anime.poster}
                  genre={anime.genre}
                  releaseYear={anime.releaseYear}
                  episodes={anime.episodes}
                  status={anime.status}
                  rating={anime.rating}
                  description={anime.description}
                  onPlay={() => handleAnimePlay(anime)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onMovieSelect={() => {}}
        movies={[]}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => navigate('/signin')}
        onRegister={() => navigate('/signup')}
      />
    </div>
  );
};

export default Anime;
