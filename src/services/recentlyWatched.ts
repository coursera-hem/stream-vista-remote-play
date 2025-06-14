
import { Movie } from '../types/Movie';

const RECENTLY_WATCHED_KEY = 'recentlyWatched';
const MAX_RECENT_MOVIES = 10;

export const addToRecentlyWatched = (movie: Movie) => {
  try {
    const existing = getRecentlyWatched();
    const filtered = existing.filter(m => m.id !== movie.id);
    const updated = [movie, ...filtered].slice(0, MAX_RECENT_MOVIES);
    localStorage.setItem(RECENTLY_WATCHED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error adding to recently watched:', error);
  }
};

export const getRecentlyWatched = (): Movie[] => {
  try {
    const stored = localStorage.getItem(RECENTLY_WATCHED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recently watched:', error);
    return [];
  }
};

export const clearRecentlyWatched = () => {
  try {
    localStorage.removeItem(RECENTLY_WATCHED_KEY);
  } catch (error) {
    console.error('Error clearing recently watched:', error);
  }
};
