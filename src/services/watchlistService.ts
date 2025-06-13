
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface WatchlistData {
  userId: string;
  movieIds: string[];
  updatedAt: Date;
}

export const addToWatchlist = async (userId: string, movieId: string) => {
  try {
    const watchlistRef = doc(db, 'watchlists', userId);
    const watchlistDoc = await getDoc(watchlistRef);

    if (watchlistDoc.exists()) {
      await updateDoc(watchlistRef, {
        movieIds: arrayUnion(movieId),
        updatedAt: new Date()
      });
    } else {
      await setDoc(watchlistRef, {
        userId,
        movieIds: [movieId],
        updatedAt: new Date()
      });
    }
    console.log('Successfully added to watchlist:', movieId);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (userId: string, movieId: string) => {
  try {
    const watchlistRef = doc(db, 'watchlists', userId);
    await updateDoc(watchlistRef, {
      movieIds: arrayRemove(movieId),
      updatedAt: new Date()
    });
    console.log('Successfully removed from watchlist:', movieId);
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

export const getWatchlist = async (userId: string): Promise<string[]> => {
  try {
    const watchlistRef = doc(db, 'watchlists', userId);
    const watchlistDoc = await getDoc(watchlistRef);
    
    if (watchlistDoc.exists()) {
      const data = watchlistDoc.data() as WatchlistData;
      console.log('Watchlist data retrieved:', data.movieIds);
      return data.movieIds || [];
    }
    console.log('No watchlist found for user:', userId);
    return [];
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
};

export const subscribeToWatchlist = (userId: string, callback: (movieIds: string[]) => void) => {
  const watchlistRef = doc(db, 'watchlists', userId);
  
  return onSnapshot(watchlistRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as WatchlistData;
      callback(data.movieIds || []);
    } else {
      callback([]);
    }
  });
};

export const isInWatchlist = async (userId: string, movieId: string): Promise<boolean> => {
  try {
    const watchlist = await getWatchlist(userId);
    return watchlist.includes(movieId);
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
};
