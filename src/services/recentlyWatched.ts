
import { Movie } from '../types/Movie';

const RECENTLY_WATCHED_KEY = 'recentlyWatched';
const MAX_RECENT_MOVIES = 10;

// Function to validate if an image URL is likely to work
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a Google Images redirect link (these don't work as direct image sources)
  if (url.includes('images.app.goo.gl') || url.includes('goo.gl')) {
    return false;
  }
  
  // Check if it's a direct image URL
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
  
  // Allow common image hosting domains or URLs with image extensions
  const validDomains = ['unsplash.com', 'imgur.com', 'cloudinary.com', 'amazonaws.com', 'drive.google.com'];
  const hasValidDomain = validDomains.some(domain => url.includes(domain));
  
  return hasImageExtension || hasValidDomain || url.startsWith('data:image/') || url.startsWith('/');
};

// Function to get a fallback poster URL
const getFallbackPoster = (title: string): string => {
  // Use a placeholder service with the movie title
  return `https://via.placeholder.com/300x450/1f2937/ffffff?text=${encodeURIComponent(title)}`;
};

export const addToRecentlyWatched = (movie: Movie) => {
  try {
    const existing = getRecentlyWatched();
    const filtered = existing.filter(m => m.id !== movie.id);
    
    // Clean up the movie data before storing
    const cleanMovie: Movie = {
      ...movie,
      poster: isValidImageUrl(movie.poster) ? movie.poster : getFallbackPoster(movie.title),
      backdrop: movie.backdrop && isValidImageUrl(movie.backdrop) 
        ? movie.backdrop 
        : (isValidImageUrl(movie.poster) ? movie.poster : getFallbackPoster(movie.title))
    };
    
    const updated = [cleanMovie, ...filtered].slice(0, MAX_RECENT_MOVIES);
    localStorage.setItem(RECENTLY_WATCHED_KEY, JSON.stringify(updated));
    
    console.log('Added to recently watched:', cleanMovie.title);
    console.log('Poster URL:', cleanMovie.poster);
  } catch (error) {
    console.error('Error adding to recently watched:', error);
  }
};

export const getRecentlyWatched = (): Movie[] => {
  try {
    const stored = localStorage.getItem(RECENTLY_WATCHED_KEY);
    if (!stored) return [];
    
    const movies = JSON.parse(stored);
    
    // Clean up any existing movies with invalid URLs
    const cleanedMovies = movies.map((movie: Movie) => ({
      ...movie,
      poster: isValidImageUrl(movie.poster) ? movie.poster : getFallbackPoster(movie.title),
      backdrop: movie.backdrop && isValidImageUrl(movie.backdrop) 
        ? movie.backdrop 
        : (isValidImageUrl(movie.poster) ? movie.poster : getFallbackPoster(movie.title))
    }));
    
    return cleanedMovies;
  } catch (error) {
    console.error('Error getting recently watched:', error);
    return [];
  }
};

export const clearRecentlyWatched = () => {
  try {
    localStorage.removeItem(RECENTLY_WATCHED_KEY);
    console.log('Recently watched cleared');
  } catch (error) {
    console.error('Error clearing recently watched:', error);
  }
};
