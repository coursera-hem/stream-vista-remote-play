
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
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
      return data.movieIds || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
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
