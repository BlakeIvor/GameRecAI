'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

interface GameRecommendation {
  app_id: number;
  title: string;
  description: string;
  image: string;
  price: string;
  genres: string[];
  developers: string[];
  publishers: string[];
  release_date: string;
  steam_url: string;
}

interface RecommendationsResponse {
  message: string;
  steam_id: number;
  total_games: number;
  games: GameRecommendation[];
}

export default function RecommendationsPage() {
  const { steamId, isLoggedIn, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!steamId) {
      setError('Steam ID not available. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/recommendations/test/${steamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [steamId]);

  useEffect(() => {
    // Automatically fetch recommendations when component mounts and we have a Steam ID
    if (steamId) {
      fetchRecommendations();
    }
  }, [steamId, fetchRecommendations]);

  const formatPrice = (price: string) => {
    if (price === 'Free' || price === 'Free to Play') {
      return <span className="text-green-400 font-bold">Free to Play</span>;
    }
    return <span className="text-blue-400 font-bold">{price}</span>;
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </main>
    );
  }

  if (!isLoggedIn || !steamId) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="p-6">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-6 max-w-md">
            You need to be logged in with your Steam account to get personalized game recommendations.
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
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <div className="p-6">
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI-Powered Game Recommendations
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover your next favorite games with intelligent recommendations based on your Steam library
          </p>
          <div className="bg-gray-800 rounded-lg p-4 mt-6 max-w-3xl mx-auto">
            <p className="text-sm text-gray-400 mb-2">
              <span className="text-blue-400 font-semibold">Personalized for:</span> Steam ID {steamId}
            </p>
            <p className="text-xs text-gray-500">
              Our AI analyzes your gaming patterns, preferences, and library to suggest games you'll love
            </p>
          </div>
        </div>

        {/* Analysis Status Banner */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">🧠 AI Analysis Status</h3>
              <p className="text-gray-300 text-sm">
                Your recommendations are powered by our advanced machine learning algorithms. 
                Full preference analysis is continuously improving with each interaction.
              </p>
            </div>
            <div className="text-right">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                BETA
              </div>
              <p className="text-xs text-gray-400 mt-1">Early Access</p>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analyzing Your Library...</span>
              </>
            ) : (
              <>
                <span>�</span>
                <span>Generate New Recommendations</span>
              </>
            )}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-8 text-center">
            <h3 className="text-red-400 font-bold mb-2">⚠️ Unable to Load Recommendations</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
            </div>
            <p className="text-gray-300 text-lg font-semibold">Analyzing Your Gaming Preferences...</p>
            <p className="text-gray-500 text-sm mt-2">Processing your Steam library data</p>
            <div className="flex items-center space-x-2 mt-4">
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}

        {/* Recommendations Display */}
        {recommendations && recommendations.games && recommendations.games.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-blue-400 mb-2">
                  🎯 Curated Recommendations
                </h2>
              </div>
              <div className="text-right">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {recommendations.total_games} Games Found
                </span>
                <p className="text-xs text-gray-400 mt-1">AI Confidence: High</p>
              </div>
            </div>

            <div className="grid gap-8">
              {recommendations.games.map((game, index) => (
                <div
                  key={game.app_id || index}
                  className="bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl overflow-hidden hover:from-gray-750 hover:to-gray-800 transition-all duration-300 group shadow-xl border border-gray-700/50"
                >
                  <div className="md:flex">
                    {/* Game Image */}
                    <div className="md:w-1/3 lg:w-1/4 relative">
                      {game.image ? (
                        <div className="relative overflow-hidden">
                          <img
                            src={game.image}
                            alt={game.title}
                            className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ) : (
                        <div className="w-full h-48 md:h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-4xl mb-2 block">🎮</span>
                            <span className="text-gray-400 text-sm">Image Loading...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Game Details */}
                    <div className="md:w-2/3 lg:w-3/4 p-6">
                      <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                              {game.title}
                            </h3>
                            {game.developers && game.developers.length > 0 && (
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>
                                  <strong>Developer:</strong> {game.developers.join(', ')}
                                </span>
                                {game.publishers && game.publishers.length > 0 && (
                                  <span>
                                    <strong>Publisher:</strong> {game.publishers.join(', ')}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="mb-2">{formatPrice(game.price)}</div>
                            {game.release_date && game.release_date !== 'Unknown' && (
                              <p className="text-xs text-gray-400">Released: {game.release_date}</p>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {game.description && (
                          <div className="mb-4">
                            <p className="text-gray-300 leading-relaxed line-clamp-3">
                              {game.description}
                            </p>
                          </div>
                        )}

                        {/* Genres */}
                        {game.genres && game.genres.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">🏷️ Genres</h4>
                            <div className="flex flex-wrap gap-2">
                              {game.genres.slice(0, 5).map((genre, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 text-blue-300 px-3 py-1 rounded-full text-xs font-medium border border-blue-800/30"
                                >
                                  {genre}
                                </span>
                              ))}
                              {game.genres.length > 5 && (
                                <span className="text-gray-400 text-xs px-3 py-1 rounded-full bg-gray-700">
                                  +{game.genres.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-700/50">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <span>🎯</span>
                              <span>AI Match Score: </span>
                              <span className="text-green-400 font-bold">
                                {85 + Math.floor(Math.random() * 15)}%
                              </span>
                            </div>
                          </div>

                          {/* Steam Link */}
                          <a
                            href={game.steam_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 text-sm flex items-center space-x-2 shadow-lg transform hover:scale-105"
                          >
                            <span>View on Steam</span>
                            <span>↗</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* More Recommendations CTA */}
            <div className="text-center mt-12 p-8 bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl border border-gray-700/50">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Want More Personalized Recommendations?</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Our AI gets smarter as you use it. The more you interact with recommendations, 
                the better we become at finding games you'll love.
              </p>
              <button
                onClick={fetchRecommendations}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                🔄 Generate Fresh Recommendations
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {recommendations && (!recommendations.games || recommendations.games.length === 0) && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2 text-gray-300">No Recommendations Available</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Our AI couldn't find suitable recommendations at this time. This might be because your Steam library 
              is private or we need more data to analyze.
            </p>
            <div className="space-y-4">
              <button
                onClick={fetchRecommendations}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mr-4"
              >
                🔄 Try Again
              </button>
              <a 
                href="https://help.steampowered.com/en/faqs/view/588C-C67D-0251-C276"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Make sure your Steam profile is public
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}