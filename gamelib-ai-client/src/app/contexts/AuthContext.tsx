'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  steamId: string | null;
  isLoggedIn: boolean;
  login: (steamId: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    
    if (typeof window !== 'undefined') {
      try {
        const storedSteamId = localStorage.getItem('steamId');
        console.log('AuthProvider: Retrieved from localStorage:', storedSteamId);
        
        if (storedSteamId) {
          setSteamId(storedSteamId);
          console.log('AuthProvider: Set initial steamId from localStorage:', storedSteamId);
        }
      } catch (error) {
        console.error('AuthProvider: Error reading from localStorage:', error);
      }
    }
    
    setLoading(false);
    console.log('AuthProvider: Initialization complete, loading set to false');
  }, []);

  const login = (newSteamId: string) => {
    console.log('AuthProvider: Logging in with Steam ID:', newSteamId);
    
    setSteamId(newSteamId);
    console.log('AuthProvider: Set steamId state to:', newSteamId);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('steamId', newSteamId);
        console.log('AuthProvider: Stored Steam ID in localStorage');
        
        // Verify it was stored
        const verified = localStorage.getItem('steamId');
        console.log('AuthProvider: Verified localStorage contains:', verified);
      } catch (error) {
        console.error('AuthProvider: Error storing to localStorage:', error);
      }
    }
  };

  const logout = () => {
    console.log('AuthProvider: Logging out');
    
    setSteamId(null);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('steamId');
        console.log('AuthProvider: Removed Steam ID from localStorage');
      } catch (error) {
        console.error('AuthProvider: Error removing from localStorage:', error);
      }
    }
  };

  const value: AuthContextType = {
    steamId,
    isLoggedIn: !!steamId,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}