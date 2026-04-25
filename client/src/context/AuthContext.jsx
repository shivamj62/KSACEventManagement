import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  // Persistent ready state to prevent disruptive buffering on refresh
  const [isAppReady, setIsAppReady] = useState(() => {
    return sessionStorage.getItem('ksac_app_initialized') === 'true';
  });

  // Flag to suppress onAuthStateChanged profile-fetch during registration.
  // Without this, Firebase fires onAuthStateChanged the instant the account is
  // created — before the Firestore user doc exists — causing a 404 that wipes
  // user/profile state and bounces the user back to the login page.
  const isRegistering = React.useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip during registration — registerWithProfile sets state manually
      // once the Firestore doc is confirmed to exist.
      if (isRegistering.current) return;

      if (firebaseUser) {
        try {
          setUser(firebaseUser);
          const token = await firebaseUser.getIdToken();
          
          // Fetch user profile (role included)
          const response = await axios.get('/api/auth/profile', {
             headers: { Authorization: `Bearer ${token}` }
          });
          
          setProfile(response.data);
        } catch (error) {
          console.error("Auth initialization error (profile fetch):", error);
          setUser(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsAppReady(true);
      sessionStorage.setItem('ksac_app_initialized', 'true');
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const registerWithProfile = async (email, password, profileData) => {
    // Set flag BEFORE creating the Firebase account so the onAuthStateChanged
    // handler ignores the automatic sign-in event that Firebase fires immediately
    // after account creation (before Firestore doc is written).
    isRegistering.current = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      // Create the Firestore profile — doc now exists before we touch state
      const response = await axios.post('/api/auth/register', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Manually set state with confirmed data — no race, no 404
      setUser(userCredential.user);
      setProfile(response.data.user);
      setIsAppReady(true);
      sessionStorage.setItem('ksac_app_initialized', 'true');
      return response.data;
    } finally {
      // Always clear the flag so logout / future logins work normally
      isRegistering.current = false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    // Note: onAuthStateChanged will handle state cleanup
  };

  const value = {
    user,
    profile,
    role: profile?.role,
    isAppReady,
    login,
    registerWithProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
