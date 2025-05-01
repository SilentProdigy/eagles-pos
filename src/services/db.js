import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot,
  addDoc,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAyOievWqSz9vQrTA50QdIZ4NE6rdOu5_0",
  authDomain: "business-app-pwa-d0236.firebaseapp.com",
  databaseURL: "https://business-app-pwa-d0236-default-rtdb.firebaseio.com",
  projectId: "business-app-pwa-d0236",
  storageBucket: "business-app-pwa-d0236.appspot.com",
  messagingSenderId: "730405077907",
  appId: "1:730405077907:web:e24893ab4a6794e5bf9e66",
  measurementId: "G-5W9QVC9TB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
export const auth = getAuth(app);

// Modified createStore to accept currentUser as parameter
export const createStore = async (storeData, currentUser) => {
  try {
    if (!currentUser || !currentUser.uid) {
      throw new Error("User not authenticated");
    }

    const docRef = await addDoc(collection(db, 'stores'), {
      ...storeData,
      createdAt: new Date(),
      ownerId: currentUser.uid
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding store:", error);
    throw error;
  }
};

// Enhanced offline persistence with retry logic
// const setupPersistence = async () => {
//   try {
//     await enableIndexedDbPersistence(db);
//     console.log("Offline persistence enabled");
//   } catch (err) {
//     if (err.code === 'failed-precondition') {
//       console.warn('Offline persistence can only be enabled in one tab at a time.');
//     } else if (err.code === 'unimplemented') {
//       console.warn('The current browser does not support offline persistence.');
//     } else {
//       console.error('Error enabling offline persistence:', err);
//       // Retry after 5 seconds if it fails
//       setTimeout(setupPersistence, 5000);
//     }
//   }
// };

// // Initialize offline persistence
// setupPersistence();

// Improved getStoreData with error handling
export const getStoreData = (storeId, callback) => {
  if (!storeId) {
    console.error("Store ID is required");
    return () => {};
  }

  const unsubscribe = onSnapshot(
    doc(db, 'stores', storeId),
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        console.warn("No store found with ID:", storeId);
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to store:", error);
    }
  );

  return unsubscribe;
};

// Enhanced getProducts with error handling
export const getProducts = (storeId, callback) => {
  if (!storeId) {
    console.error("Store ID is required");
    return () => {};
  }

  const unsubscribe = onSnapshot(
    collection(db, 'stores', storeId, 'products'),
    (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(products);
    },
    (error) => {
      console.error("Error listening to products:", error);
    }
  );

  return unsubscribe;
};

// New helper function to get user's stores
export const getUserStores = (userId, callback) => {
  if (!userId) {
    console.error("User ID is required");
    return () => {};
  }

  const unsubscribe = onSnapshot(
    collection(db, 'stores'),
    (snapshot) => {
      const stores = snapshot.docs
        .filter(doc => doc.data().ownerId === userId)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      callback(stores);
    },
    (error) => {
      console.error("Error listening to user stores:", error);
    }
  );

  return unsubscribe;
};