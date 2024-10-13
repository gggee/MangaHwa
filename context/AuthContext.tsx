import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userProfile');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setIsAuthenticated(true);
          setUserProfile(parsedUser);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  const signIn = async (data) => {
    setIsAuthenticated(true);
    setUserProfile(data);
    await saveUserProfile(data);
  };

  const signOut = async () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    await AsyncStorage.removeItem('userProfile');
  };

  const saveUserProfile = async (profile) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);