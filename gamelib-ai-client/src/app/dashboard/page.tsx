'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { steamId, steamName, isLoggedIn, login, logout, loading } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('Dashboard useEffect triggered');
    console.log('Current auth state - steamId:', steamId, 'isLoggedIn:', isLoggedIn, 'loading:', loading);
    
    if (typeof window !== 'undefined') {
      console.log('Current URL:', window.location.href);
      console.log('SearchParams object:', searchParams);
      
      // Get Steam ID from URL params (from Steam auth redirect)
      const steamIdParam = searchParams.get('steam_id');
      console.log('Steam ID from URL params:', steamIdParam);
      
      if (steamIdParam) {
        console.log('Found Steam ID in URL, logging in user');
        // Use the context login method (now async)
        login(steamIdParam).then(() => {
          console.log('Login completed successfully');
          // Wait a bit before clearing URL to ensure login completes
          setTimeout(() => {
            console.log('Clearing URL params after login');
            window.history.replaceState({}, '', '/dashboard');
          }, 100);
        }).catch((error) => {
          console.error('Login failed:', error);
        });
      }
    } else {
      console.log('Dashboard - window not available (SSR)');
    }
  }, [searchParams, login]);

  const handleLogout = () => {
    console.log('Dashboard logout clicked');
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  // Check if we have a steam_id in URL params - if so, don't redirect even if not logged in yet
  const steamIdParam = searchParams.get('steam_id');
  
  console.log('Dashboard render check:', {
    loading,
    isLoggedIn, 
    steamIdParam,
    shouldShowLogin: !loading && !isLoggedIn && !steamIdParam
  });
  
  if (!loading && !isLoggedIn && !steamIdParam) {
    console.log('Dashboard: Not logged in and no Steam ID param, showing login prompt');
    return (
      <main className="flex min-h-screen items-center justify-center bg-black flex-col gap-4">
        <h1 className="text-white text-3xl font-bold">Welcome to GameLib.Ai</h1>
        <p className="text-gray-300">Please log in to access your dashboard</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Login
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to your GameLib.Ai Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <p className="text-gray-300">Steam Name: {steamName || (steamId ? 'Fetching name...' : 'Not available')}</p>
          <p className="text-gray-300 text-sm">Steam ID: {steamId}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/recommendations" 
            className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg block transition-colors"
          >
            <h3 className="text-xl font-semibold mb-2">Game Recommendations</h3>
            <p className="text-gray-300">Get personalized game recommendations based on your Steam library</p>
          </Link>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-gray-300">More features are being developed!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
