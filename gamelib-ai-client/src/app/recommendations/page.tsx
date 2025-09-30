'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

interface GameCluster {
  // Define the structure based on what the API returns
  [key: string]: any;
}

export default function RecommendationsPage() {
  const { steamId, isLoggedIn, loading: authLoading } = useAuth();
  const [clusters, setClusters] = useState<GameCluster | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualSteamId, setManualSteamId] = useState<string>('');

  useEffect(() => {
    // Use auth context Steam ID if logged in
    if (isLoggedIn && steamId) {
      setManualSteamId(steamId);
      // Automatically fetch recommendations for logged-in user
      fetchGameClusters(steamId);
    }
  }, [isLoggedIn, steamId]);

  const fetchGameClusters = async (targetSteamId?: string) => {
    const idToUse = targetSteamId || manualSteamId;
    
    if (!idToUse) {
      setError('Please enter a Steam ID or log in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/recommendations/${idToUse}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setClusters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Game Recommendations</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p className="mb-4">Please log in to get personalized recommendations, or enter a Steam ID manually.</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login with Steam
          </Link>
        </div>
        
        <div className="mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="steamId" className="block text-sm font-medium text-gray-700 mb-2">
                Or Enter Steam ID Manually
              </label>
              <input
                type="text"
                id="steamId"
                value={manualSteamId}
                onChange={(e) => setManualSteamId(e.target.value)}
                placeholder="Enter Steam ID (e.g., 76561198000000000)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => fetchGameClusters()}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Get Recommendations'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {clusters && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Game Clusters</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm text-black">
              {JSON.stringify(clusters, null, 2)}
            </pre>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Game Recommendations</h1>
        <div className="text-sm text-gray-600">
          Logged in as Steam ID: {steamId || 'N/A'}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="steamId" className="block text-sm font-medium text-gray-700 mb-2">
              Steam ID
            </label>
            <input
              type="text"
              id="steamId"
              value={manualSteamId}
              onChange={(e) => setManualSteamId(e.target.value)}
              placeholder="Enter Steam ID (e.g., 76561198000000000)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => fetchGameClusters()}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error}
        </div>
      )}

      {clusters && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Game Clusters</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm text-black">
            {JSON.stringify(clusters, null, 2)}
          </pre>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}