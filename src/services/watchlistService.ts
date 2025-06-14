
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface WatchlistData {
  userId: string;
  movieIds: string[];
  updatedAt: Date;
}

// Migration function to move data from old watchlists to mylists
export const migrateWatchlistData = async (userId: string) => {
  try {
    console.log('Starting migration check for user:', userId);
    
    // Check if data exists in old watchlists collection
    const oldWatchlistRef = doc(db, 'watchlists', userId);
    const oldWatchlistDoc = await getDoc(oldWatchlistRef);
    
    // Check if data already exists in new mylists collection
    const myListRef = doc(db, 'mylists', userId);
    const myListDoc = await getDoc(myListRef);
    
    console.log('Old watchlist exists:', oldWatchlistDoc.exists());
    console.log('New mylist exists:', myListDoc.exists());
    
    if (oldWatchlistDoc.exists() && !myListDoc.exists()) {
      const oldData = oldWatchlistDoc.data() as WatchlistData;
      console.log('Migrating data:', oldData.movieIds);
      
      // Copy data to new collection
      await setDoc(myListRef, {
        userId,
        movieIds: oldData.movieIds || [],
        updatedAt: new Date()
      });
      
      console.log('Migration completed successfully');
      return true;
    } else if (oldWatchlistDoc.exists() && myListDoc.exists()) {
      console.log('Both collections exist, no migration needed');
    } else if (!oldWatchlistDoc.exists() && !myListDoc.exists()) {
      console.log('No data in either collection');
    } else {
      console.log('Data already in new collection');
    }
    
    return false;
  } catch (error) {
    console.error('Error during migration:', error);
    return false;
  }
};

export const addToWatchlist = async (userId: string, movieId: string) => {
  try {
    console.log('Adding to my list - userId:', userId, 'movieId:', movieId);
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
    console.log('Removing from my list - userId:', userId, 'movieId:', movieId);
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
    console.log('Getting my list for user:', userId);
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
  console.log('Setting up real-time subscription for user:', userId);
  const myListRef = doc(db, 'mylists', userId);
  
  return onSnapshot(myListRef, (doc) => {
    console.log('Subscription triggered - doc exists:', doc.exists());
    if (doc.exists()) {
      const data = doc.data() as WatchlistData;
      console.log('Subscription data:', data.movieIds);
      callback(data.movieIds || []);
    } else {
      console.log('No document found in subscription');
      callback([]);
    }
  });
};

export const isInWatchlist = async (userId: string, movieId: string): Promise<boolean> => {
  try {
    const myList = await getWatchlist(userId);
    const isInList = myList.includes(movieId);
    console.log('Checking if movie', movieId, 'is in list:', isInList);
    return isInList;
  } catch (error) {
    console.error('Error checking my list:', error);
    return false;
  }
};
