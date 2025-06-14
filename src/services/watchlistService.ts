
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface WatchlistData {
  userId: string;
  movieIds: string[];
  updatedAt: Date;
}

export const addToWatchlist = async (userId: string, movieId: string) => {
  try {
    const myListRef = doc(db, 'mylists', userId);
    const myListDoc = await getDoc(myListRef);

    if (myListDoc.exists()) {
      await updateDoc(myListRef, {
        movieIds: arrayUnion(movieId),
        updatedAt: new Date()
      });
    } else {
      await setDoc(myListRef, {
        userId,
        movieIds: [movieId],
        updatedAt: new Date()
      });
    }
    console.log('Successfully added to my list:', movieId);
  } catch (error) {
    console.error('Error adding to my list:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (userId: string, movieId: string) => {
  try {
    const myListRef = doc(db, 'mylists', userId);
    await updateDoc(myListRef, {
      movieIds: arrayRemove(movieId),
      updatedAt: new Date()
    });
    console.log('Successfully removed from my list:', movieId);
  } catch (error) {
    console.error('Error removing from my list:', error);
    throw error;
  }
};

export const getWatchlist = async (userId: string): Promise<string[]> => {
  try {
    const myListRef = doc(db, 'mylists', userId);
    const myListDoc = await getDoc(myListRef);
    
    if (myListDoc.exists()) {
      const data = myListDoc.data() as WatchlistData;
      console.log('My list data retrieved:', data.movieIds);
      return data.movieIds || [];
    }
    console.log('No my list found for user:', userId);
    return [];
  } catch (error) {
    console.error('Error getting my list:', error);
    return [];
  }
};

export const subscribeToWatchlist = (userId: string, callback: (movieIds: string[]) => void) => {
  const myListRef = doc(db, 'mylists', userId);
  
  return onSnapshot(myListRef, (doc) => {
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
    const myList = await getWatchlist(userId);
    return myList.includes(movieId);
  } catch (error) {
    console.error('Error checking my list:', error);
    return false;
  }
};
