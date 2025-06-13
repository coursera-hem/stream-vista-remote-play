
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBqLfl_ZylIJpW6AwpYFwAbwEfMn84RrdA",
  authDomain: "movie-streaming-fe414.firebaseapp.com",
  projectId: "movie-streaming-fe414",
  storageBucket: "movie-streaming-fe414.firebasestorage.app",
  messagingSenderId: "706037899873",
  appId: "1:706037899873:web:aea2d672003c9081680020"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
