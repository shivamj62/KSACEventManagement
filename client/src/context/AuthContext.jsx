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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    const response = await axios.post('/api/auth/register', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setProfile(response.data);
    setUser(userCredential.user);
    return response.data;
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
