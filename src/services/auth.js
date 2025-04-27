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
  
  // Session timing configuration (in milliseconds)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before timeout
  
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  let logoutTimer;
  let warningTimer;

  const clearTimers = () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    if (warningTimer) clearTimeout(warningTimer);
  };

  const setTimers = () => {
    clearTimers();
    
    // Set warning timer
    warningTimer = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(WARNING_TIME / 1000); // Convert to seconds
      
      // Update countdown every second
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    }, SESSION_TIMEOUT - WARNING_TIME);
    
    // Set logout timer
    logoutTimer = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
  };

  const extendSession = () => {
    setShowWarning(false);
    setTimers();
  };

  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setTimers(); // Updated to use setTimers instead of setLogoutTimer
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setTimers(); // Updated to use setTimers instead of setLogoutTimer
    } catch (error) {
      throw error;
    }
  };

  const guestLogin = async () => {
    try {
      await signInAnonymously(auth);
      setTimers(); // Updated to use setTimers instead of setLogoutTimer
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      clearTimers(); // Updated to use clearTimers instead of clearLogoutTimer
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleActivity = () => {
      if (currentUser) {
        clearTimers();
        setTimers();
        setShowWarning(false);
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => 
      window.addEventListener(event, handleActivity)
    );

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        setTimers();
        setShowWarning(false);
      }
    });

    return () => {
      unsubscribe();
      clearTimers();
      events.forEach(event => 
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [auth, currentUser]);

  const value = {
    currentUser,
    register,
    login,
    guestLogin,
    logout,
    loading,
    showWarning,
    timeLeft,
    extendSession
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);