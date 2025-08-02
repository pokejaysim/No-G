import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions for checks
export const saveCheck = async (userId, checkData) => {
  try {
    const docRef = await addDoc(collection(db, 'checks'), {
      userId,
      ...checkData,
      timestamp: serverTimestamp(),
      isFavorite: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving check:', error);
    throw error;
  }
};

export const getUserChecks = async (userId) => {
  try {
    const q = query(
      collection(db, 'checks'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting checks:', error);
    throw error;
  }
};

export const toggleFavorite = async (checkId, isFavorite) => {
  try {
    const checkRef = doc(db, 'checks', checkId);
    await updateDoc(checkRef, {
      isFavorite: !isFavorite
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const deleteCheck = async (checkId) => {
  try {
    await deleteDoc(doc(db, 'checks', checkId));
  } catch (error) {
    console.error('Error deleting check:', error);
    throw error;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const q = query(
      collection(db, 'checks'),
      where('userId', '==', userId),
      where('isFavorite', '==', true),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};