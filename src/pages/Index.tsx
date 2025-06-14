import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FocusProvider } from '../components/FocusProvider';
import { Navigation } from '../components/Navigation';
import { HeroCarousel } from '../components/HeroCarousel';
import { MovieCarousel } from '../components/MovieCarousel';
import { SearchModal } from '../components/SearchModal';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { LoginModal } from '../components/LoginModal';
import { VideoPlayer } from '../components/VideoPlayer';
import { useAuth } from '../contexts/AuthContext';
import { addToRecentlyWatched, getRecentlyWatched } from '../services/recentlyWatched';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

interface AppMovie {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
  description: string;
  videoUrl: string;
  releaseYear?: number;
  language?: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  views?: number;
}

interface RecentlyWatchedMovie {
  id: string;
  title: string;
  poster: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
}

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

const Index = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<AppMovie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatchedMovie[]>([]);
  const [movies, setMovies] = useState<AppMovie[]>([]);
  const [animes, setAnimes] = useState<AppMovie[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchMovies(), fetchAnimes()]).finally(() => setLoading(false));
    setRecentlyWatched(getRecentlyWatched());
  }, []);

  const fetchMovies = async () => {
    try {
      console.log('Starting to fetch movies from Firebase...');
      console.log('Firebase DB instance:', db);
      
      const moviesCollection = collection(db, 'movies');
      console.log('Movies collection reference:', moviesCollection);
      
      // Try without orderBy first to see if that's causing issues
      console.log('Attempting to get all documents from movies collection...');
      const movieSnapshot = await getDocs(moviesCollection);
      console.log('Movie snapshot received:', movieSnapshot);
      console.log('Number of docs in snapshot:', movieSnapshot.size);
      console.log('Snapshot empty?', movieSnapshot.empty);
      
      if (movieSnapshot.empty) {
        console.log('No documents found in movies collection');
        toast({
          title: "No Movies Found",
          description: "No movies found in the database. Please upload some movies from the admin dashboard.",
        });
        return;
      }

      const movieList: AppMovie[] = [];
      
      movieSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Movie ${index + 1} - Doc ID: ${doc.id}`, data);
        
        // Transform Firebase data to match our AppMovie interface
        const movie: AppMovie = {
          id: doc.id,
          title: data.title || 'Untitled',
          poster: data.poster || '/placeholder.svg',
          backdrop: data.backdrop || data.poster || '/placeholder.svg',
          year: data.releaseYear || data.year || new Date().getFullYear(),
          genre: data.genre || 'Unknown',
          rating: data.rating || 0,
          duration: data.duration || 'Unknown',
          description: data.description || 'No description available',
          videoUrl: data.videoUrl || data.driveLink || '',
          releaseYear: data.releaseYear,
          language: data.language,
          isTrending: data.isTrending || false,
          isFeatured: data.isFeatured || false,
          views: data.views || 0
        };
        
        console.log(`Transformed movie ${index + 1}:`, movie);
        movieList.push(movie);
      });

      console.log('Final movie list:', movieList);
      console.log('Total movies loaded:', movieList.length);
      
      setMovies(movieList);

      toast({
        title: "Movies Loaded",
        description: `Successfully loaded ${movieList.length} movies from database.`,
      });
      
    } catch (error) {
      console.error('Error fetching movies:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast({
        title: "Error Loading Movies",
        description: `Failed to load movies: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const fetchAnimes = async () => {
    try {
      console.log('Fetching animes from Firebase...');
      const animesCollection = collection(db, 'animes');
      const animeSnapshot = await getDocs(animesCollection);
      
      if (animeSnapshot.empty) {
        console.log('No anime documents found');
        return;
      }

      const animeList: AppMovie[] = [];
      
      animeSnapshot.docs.forEach((doc, index) => {
        const data = doc.data() as FirebaseAnime;
        console.log(`Anime ${index + 1} - Doc ID: ${doc.id}`, data);
        
        // Transform anime data to match AppMovie interface for carousel compatibility
        const anime: AppMovie = {
          id: doc.id,
          title: data.title || 'Untitled',
          poster: data.poster || '/placeholder.svg',
          backdrop: data.poster || '/placeholder.svg',
          year: data.releaseYear || new Date().getFullYear(),
          genre: data.genre || 'Anime',
          rating: data.rating || 0,
          duration: `${data.episodes} episodes`,
          description: data.description || 'No description available',
          videoUrl: data.videoUrl || '',
          releaseYear: data.releaseYear,
          language: data.language,
          isTrending: data.isTrending || false,
          isFeatured: data.isFeatured || false,
          views: data.views || 0
        };
        
        animeList.push(anime);
      });

      console.log('Total animes loaded:', animeList.length);
      setAnimes(animeList);

      toast({
        title: "Anime Loaded",
        description: `Successfully loaded ${animeList.length} anime from database.`,
      });
      
    } catch (error) {
      console.error('Error fetching animes:', error);
      toast({
        title: "Error Loading Anime",
        description: `Failed to load anime: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleMovieSelect = (movie: AppMovie | RecentlyWatchedMovie) => {
    // Convert RecentlyWatchedMovie to AppMovie if needed
    const fullMovie = movies.find(m => m.id === movie.id) || animes.find(a => a.id === movie.id) || {
      ...movie,
      backdrop: movie.poster,
      description: 'No description available',
      videoUrl: '',
      releaseYear: movie.year,
      language: 'Unknown',
      isTrending: false,
      isFeatured: false,
      views: 0
    } as AppMovie;
    
    setSelectedMovie(fullMovie);
    setShowMovieDetail(true);
  };

  const handlePlayMovie = (movie: AppMovie | RecentlyWatchedMovie) => {
    // Convert RecentlyWatchedMovie to AppMovie if needed and add to recently watched
    const fullMovie = movies.find(m => m.id === movie.id) || animes.find(a => a.id === movie.id) || {
      ...movie,
      backdrop: movie.poster,
      description: 'No description available',
      videoUrl: '',
      releaseYear: movie.year,
      language: 'Unknown',
      isTrending: false,
      isFeatured: false,
      views: 0
    } as AppMovie;

    // Add to recently watched (convert to the format expected by the service)
    const recentMovie = {
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      backdrop: movie.poster, // Add required backdrop property
      year: movie.year,
      genre: movie.genre,
      rating: movie.rating,
      duration: movie.duration,
      description: 'No description available' // Add required description property
    };
    addToRecentlyWatched(recentMovie);
    setRecentlyWatched(getRecentlyWatched());
    
    setSelectedMovie(fullMovie);
    setShowMovieDetail(false);
    setShowVideoPlayer(true);
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    await logout();
    setWatchlist([]);
  };

  const handleToggleWatchlist = (movieId: string) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }

    setWatchlist(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  // Group movies by categories
  const trendingMovies = movies.filter(movie => movie.isTrending);
  const actionMovies = movies.filter(movie => movie.genre.toLowerCase().includes('action'));
  const sciFiMovies = movies.filter(movie => movie.genre.toLowerCase().includes('sci-fi') || movie.genre.toLowerCase().includes('science'));
  const animeMovies = movies.filter(movie => 
    movie.genre.toLowerCase().includes('anime') || 
    movie.genre.toLowerCase().includes('animation') ||
    movie.title.toLowerCase().includes('anime')
  );
  const recentMovies = movies.slice(0, 10); // Most recent 10 movies
  const topRatedMovies = movies.filter(movie => movie.rating >= 8).sort((a, b) => b.rating - a.rating);

  // Filter anime for the new section (featured and trending)
  const featuredAndTrendingAnime = animes.filter(anime => anime.isFeatured || anime.isTrending);

  // Get featured items for hero carousel (combine featured movies and anime)
  const featuredMovies = movies.filter(movie => movie.isFeatured);
  const featuredAnimes = animes.filter(anime => anime.isFeatured);
  const allFeaturedItems = [...featuredMovies, ...featuredAnimes];

  // If no featured items, use top-rated or most recent items
  const heroItems = allFeaturedItems.length > 0 
    ? allFeaturedItems 
    : [...topRatedMovies.slice(0, 3), ...featuredAndTrendingAnime.slice(0, 2)];

  console.log('Current movies state:', movies);
  console.log('Movies length:', movies.length);
  console.log('Loading state:', loading);

  if (showVideoPlayer && selectedMovie) {
    return (
      <VideoPlayer
        movie={selectedMovie}
        onBack={() => setShowVideoPlayer(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading content...</div>
      </div>
    );
  }

  if (movies.length === 0 && animes.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation
          onSearch={() => setShowSearch(true)}
          onLogin={handleLogin}
          isLoggedIn={!!currentUser}
          onLogout={handleLogout}
          currentUser={userData ? { name: userData.name, email: userData.email } : undefined}
        />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">No Content Available</h1>
            <p className="text-gray-400 mb-8">Upload some movies or anime from the admin dashboard to get started.</p>
            <div className="mb-4">
              <button
                onClick={() => Promise.all([fetchMovies(), fetchAnimes()])}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold mr-4"
              >
                Refresh Content
              </button>
              {userData?.isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Go to Admin Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FocusProvider>
      <div className="min-h-screen bg-black text-white">
        <Navigation
          onSearch={() => setShowSearch(true)}
          onLogin={handleLogin}
          isLoggedIn={!!currentUser}
          onLogout={handleLogout}
          currentUser={userData ? { name: userData.name, email: userData.email } : undefined}
        />

        {/* Hero Carousel Section */}
        {heroItems.length > 0 && (
          <HeroCarousel
            featuredItems={heroItems}
            onPlay={handlePlayMovie}
            onMoreInfo={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {/* Movie Carousels */}
        <div className="relative -mt-32 z-10 space-y-8 pb-20">
          {/* Recently Watched - Now comes first */}
          {recentlyWatched.length > 0 && (
            <MovieCarousel
              title="Recently Watched"
              movies={recentlyWatched}
              rowIndex={0}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}

          {/* Recently Added Movies */}
          <MovieCarousel
            title="Recently Added"
            movies={recentMovies}
            rowIndex={recentlyWatched.length > 0 ? 1 : 0}
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />

          {/* Recently Added Anime */}
          {featuredAndTrendingAnime.length > 0 && (
            <MovieCarousel
              title="Recently Added Anime"
              movies={featuredAndTrendingAnime}
              rowIndex={recentlyWatched.length > 0 ? 2 : 1}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}
          
          {/* Trending Movies */}
          {trendingMovies.length > 0 && (
            <MovieCarousel
              title="Trending Now"
              movies={trendingMovies}
              rowIndex={recentlyWatched.length > 0 ? 3 : 2}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}

          {/* Anime Section */}
          {animeMovies.length > 0 && (
            <MovieCarousel
              title="Anime Collection"
              movies={animeMovies}
              rowIndex={recentlyWatched.length > 0 ? 4 : 3}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}
          
          {/* Action Movies */}
          {actionMovies.length > 0 && (
            <MovieCarousel
              title="Action Movies"
              movies={actionMovies}
              rowIndex={recentlyWatched.length > 0 ? 5 : 4}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}
          
          {/* Sci-Fi Movies */}
          {sciFiMovies.length > 0 && (
            <MovieCarousel
              title="Sci-Fi Collection"
              movies={sciFiMovies}
              rowIndex={recentlyWatched.length > 0 ? 6 : 5}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}
          
          {/* Top Rated Movies */}
          {topRatedMovies.length > 0 && (
            <MovieCarousel
              title="Top Rated"
              movies={topRatedMovies}
              rowIndex={recentlyWatched.length > 0 ? 7 : 6}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}

          {/* All Movies if no specific categories */}
          {trendingMovies.length === 0 && actionMovies.length === 0 && sciFiMovies.length === 0 && animeMovies.length === 0 && (
            <MovieCarousel
              title="All Movies"
              movies={movies}
              rowIndex={recentlyWatched.length > 0 ? 3 : 2}
              onMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}
        </div>

        {/* Modals */}
        <SearchModal
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onMovieSelect={handleMovieSelect}
          movies={[...movies, ...animes]}
        />

        <MovieDetailModal
          movie={selectedMovie}
          isOpen={showMovieDetail}
          onClose={() => setShowMovieDetail(false)}
          onPlay={handlePlayMovie}
          isInWatchlist={selectedMovie ? watchlist.includes(selectedMovie.id) : false}
          onToggleWatchlist={handleToggleWatchlist}
        />

        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
          onRegister={() => navigate('/signup')}
        />
      </div>
    </FocusProvider>
  );
};

export default Index;
