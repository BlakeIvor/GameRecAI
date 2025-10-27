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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 to-black">
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
      <main className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to GameLib.AI
          </h1>
          <p className="text-xl text-gray-300 mb-6 max-w-md">
            Please log in with your Steam account to access your personalized gaming dashboard
          </p>
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Login with Steam
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Gaming Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Your personalized gaming hub powered by AI
          </p>
          {steamName && (
            <div className="bg-gray-800 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
              <p className="text-sm text-gray-400 mb-1">
                <span className="text-blue-400 font-semibold">Welcome back,</span> {steamName}
              </p>
              <p className="text-xs text-gray-500">Steam ID: {steamId}</p>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-blue-400">My Profile</h2>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="text-gray-400">Steam Name:</span> {steamName || (steamId ? 'Fetching name...' : 'Not available')}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400">Steam ID:</span> {steamId}
                </p>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Link 
            href="/recommendations" 
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-8 rounded-xl block transition-all duration-300 group shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">🎯</span>
              <h3 className="text-2xl font-bold text-white">AI Recommendations</h3>
            </div>
            <p className="text-blue-100 leading-relaxed">
              Get personalized game recommendations powered by advanced AI analysis of your Steam library and gaming preferences.
            </p>
            <div className="mt-4 text-blue-200 text-sm flex items-center">
              <span>Explore recommendations</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-8 rounded-xl border border-gray-700/50">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">🚀</span>
              <h3 className="text-2xl font-bold text-gray-300">Coming Soon</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              More exciting features are in development! Stay tuned for library analytics, friend comparisons, and advanced gaming insights.
            </p>
            <div className="mt-4">
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                In Development
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/about"
              className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors block text-center"
            >
              <span className="text-2xl mb-2 block">ℹ️</span>
              <span className="text-sm font-medium">About GameLib.AI</span>
            </Link>
            <Link 
              href="/contact"
              className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors block text-center"
            >
              <span className="text-2xl mb-2 block">📧</span>
              <span className="text-sm font-medium">Contact Support</span>
            </Link>
            <div className="bg-gray-700/50 p-4 rounded-lg text-center opacity-50 cursor-not-allowed">
              <span className="text-2xl mb-2 block">⚙️</span>
              <span className="text-sm font-medium">Settings (Soon)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
