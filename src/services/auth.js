import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  let logoutTimer;

  // Add this to your auth.js useEffect hook
  useEffect(() => {
    const handleActivity = () => {
      if (currentUser) {
        clearLogoutTimer();
        setLogoutTimer();
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [currentUser]);

  const clearLogoutTimer = () => {
    if (logoutTimer) clearTimeout(logoutTimer);
  };

  const setLogoutTimer = () => {
    clearLogoutTimer();
    logoutTimer = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
  };

  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setLogoutTimer();
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLogoutTimer();
    } catch (error) {
      throw error;
    }
  };

  const guestLogin = async () => {
    try {
      await signInAnonymously(auth);
      setLogoutTimer();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      clearLogoutTimer();
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) setLogoutTimer();
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      clearLogoutTimer();
    };
  }, [auth]);

  const value = {
    currentUser,
    register,
    login,
    guestLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);