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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const token = await firebaseUser.getIdToken();
          const response = await axios.get('/api/auth/profile', {
             headers: { Authorization: `Bearer ${token}` }
          });
          setProfile(response.data);
        } catch (error) {
          console.error("Error fetching user role:", error);
          setProfile({ role: 'student' }); // Fallback
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
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

  const logout = () => signOut(auth);

  const value = {
    user,
    profile,
    role: profile?.role,
    login,
    registerWithProfile,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
