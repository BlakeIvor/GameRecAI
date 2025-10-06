'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  steamId: string | null;
  steamName: string | null;
  isLoggedIn: boolean;
  login: (steamId: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [steamName, setSteamName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    
    if (typeof window !== 'undefined') {
      try {
        const storedSteamId = localStorage.getItem('steamId');
        const storedSteamName = localStorage.getItem('steamName');
        console.log('AuthProvider: Retrieved from localStorage:', storedSteamId, storedSteamName);
        
        if (storedSteamId) {
          setSteamId(storedSteamId);
          console.log('AuthProvider: Set initial steamId from localStorage:', storedSteamId);
          
          if (storedSteamName) {
            setSteamName(storedSteamName);
            console.log('AuthProvider: Set initial steamName from localStorage:', storedSteamName);
          } else {
            // If we have steamId but no steamName, fetch it from API
            console.log('AuthProvider: No steamName in localStorage, fetching from API');
            fetchSteamName(storedSteamId);
          }
        }
      } catch (error) {
        console.error('AuthProvider: Error reading from localStorage:', error);
      }
    }
    
    setLoading(false);
    console.log('AuthProvider: Initialization complete, loading set to false');
  }, []);

  // Helper function to fetch steam name
  const fetchSteamName = async (steamId: string) => {
    try {
      console.log('AuthProvider: Fetching Steam name for ID:', steamId);
      const response = await fetch(`http://localhost:8000/api/users/${steamId}/name`);
      
      if (!response.ok) {
        console.error('AuthProvider: API response not ok:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('AuthProvider: Received Steam user data:', data);
      
      const steamName = data.name;
      if (steamName) {
        console.log('AuthProvider: Setting steamName state to:', steamName);
        setSteamName(steamName);
        
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('steamName', steamName);
          console.log('AuthProvider: Stored steamName in localStorage');
        }
      } else {
        console.warn('AuthProvider: No personaname found in API response');
      }
    } catch (err) {
      console.error('AuthProvider: Error fetching Steam name:', err);
    }
  };

  const login = async (newSteamId: string) => {
    console.log('AuthProvider: Logging in with Steam ID:', newSteamId);
    
    setSteamId(newSteamId);
    console.log('AuthProvider: Set steamId state to:', newSteamId);

    // Store steamId in localStorage immediately
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('steamId', newSteamId);
        console.log('AuthProvider: Stored Steam ID in localStorage');
      } catch (error) {
        console.error('AuthProvider: Error storing steamId to localStorage:', error);
      }
    }

    // Fetch steam name
    await fetchSteamName(newSteamId);
  };

  const logout = () => {
    console.log('AuthProvider: Logging out');
    
    setSteamId(null);
    setSteamName(null);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('steamId');
        localStorage.removeItem('steamName');
        console.log('AuthProvider: Removed Steam ID and name from localStorage');
      } catch (error) {
        console.error('AuthProvider: Error removing from localStorage:', error);
      }
    }
  };

  const value: AuthContextType = {
    steamId,
    steamName,
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