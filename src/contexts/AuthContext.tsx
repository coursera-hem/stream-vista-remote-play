
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserData {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
  profileImage?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    // Set persistence to keep user logged in
    setPersistence(auth, browserLocalPersistence);
  }, []);

  const fetchUserData = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
        console.log('User data loaded:', data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    
    // Check if this is the first user (make them admin)
    const usersSnapshot = await getDoc(doc(db, 'settings', 'userCount'));
    const isFirstUser = !usersSnapshot.exists();
    
    const userData = {
      uid: user.uid,
      email: user.email!,
      name,
      isAdmin: isFirstUser // First user becomes admin
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    if (isFirstUser) {
      await setDoc(doc(db, 'settings', 'userCount'), { count: 1 });
    }
  };

  const loginWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Check if this is the first user (make them admin)
      const usersSnapshot = await getDoc(doc(db, 'settings', 'userCount'));
      const isFirstUser = !usersSnapshot.exists();
      
      const userData = {
        uid: user.uid,
        email: user.email!,
        name: user.displayName || 'Google User',
        isAdmin: isFirstUser, // First user becomes admin
        profileImage: user.photoURL || undefined // Save Google profile image
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      if (isFirstUser) {
        await setDoc(doc(db, 'settings', 'userCount'), { count: 1 });
      }
    } else {
      // Update existing user with Google profile image if not already set
      const existingData = userDoc.data() as UserData;
      if (!existingData.profileImage && user.photoURL) {
        const updatedData = {
          ...existingData,
          profileImage: user.photoURL,
          name: user.displayName || existingData.name // Update name if changed
        };
        await setDoc(doc(db, 'users', user.uid), updatedData);
      }
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!currentUser) return;
    
    const updatedData = { ...userData, ...data };
    await setDoc(doc(db, 'users', currentUser.uid), updatedData);
    setUserData(updatedData);
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
