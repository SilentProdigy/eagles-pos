import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAyOievWqSz9vQrTA50QdIZ4NE6rdOu5_0",
  authDomain: "business-app-pwa-d0236.firebaseapp.com",
  databaseURL: "https://business-app-pwa-d0236-default-rtdb.firebaseio.com",
  projectId: "business-app-pwa-d0236",
  storageBucket: "business-app-pwa-d0236.firebasestorage.app",
  messagingSenderId: "730405077907",
  appId: "1:730405077907:web:e24893ab4a6794e5bf9e66",
  measurementId: "G-5W9QVC9TB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Offline persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support offline persistence.');
    }
  });

// Helper function to listen to store data
export const getStoreData = (storeId, callback) => {
  return onSnapshot(doc(db, 'stores', storeId), (doc) => {
    callback({ id: doc.id, ...doc.data() });
  });
};

// Helper function to listen to products
export const getProducts = (storeId, callback) => {
  return onSnapshot(collection(db, 'stores', storeId, 'products'), (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(products);
  });
};