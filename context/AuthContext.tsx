import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null); 

  const signIn = (data) => {
    setIsAuthenticated(true);
    setUserProfile(data); 
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUserProfile(null); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);