'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

interface GameRecommendation {
  appid: number;
  name: string;
  header_image: string;
  short_description: string;
  genres: string[];
  price: string;
  recommendation_score: number;
  recommended_by_count: number;
  steam_url: string;
}

interface SimilarUser {
  steam_id: number;
  similarity_score: number;
  top_games_overlap: number;
  total_games_overlap: number;
}

interface CollaborativeRecommendationsResponse {
  success: boolean;
  error?: string;
  recommendations: GameRecommendation[];
  similar_users: SimilarUser[];
  user_top_games: number[];
  total_users_analyzed: number;
  similar_users_found: number;
}

interface CachedData {
  recommendations: GameRecommendation[];
  similarUsers: SimilarUser[];
  stats: {
    userTopGames: number[];
    totalUsersAnalyzed: number;
    similarUsersFound: number;
  };
  filters: {
    topNGames: number;
    minPlaytime: number;
    maxSimilarUsers: number;
    maxRecommendations: number;
    selectedGenres: string[];
    maxPrice: string;
  };
  timestamp: number;
  steamId: string;
}

export default function CollaborativeRecommendationsPage() {
  const { steamId, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
  const [stats, setStats] = useState<{
    userTopGames: number[];
    totalUsersAnalyzed: number;
    similarUsersFound: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);  

  // Filter state
  const [topNGames, setTopNGames] = useState<number>(5);
  const [minPlaytime, setMinPlaytime] = useState<number>(60);
  const [maxSimilarUsers, setMaxSimilarUsers] = useState<number>(1000);
  const [maxRecommendations, setMaxRecommendations] = useState<number>(20);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<string>('none');
  const [showFilters, setShowFilters] = useState(false);

  // Use ref to track if initial load has been done
  const hasLoadedRef = useRef(false);

  // Available genres (common Steam genres)
  const availableGenres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports',
    'Racing', 'Indie', 'Casual', 'Puzzle', 'Shooter', 'Platformer',
    'Massively Multiplayer', 'Fighting', 'Horror', 'Survival'
  ];

  // Cache key for localStorage
  const getCacheKey = () => `collab_recs_${steamId}`;

  // Check if current filters match cached filters
  const filtersMatch = (cachedFilters: CachedData['filters']) => {
    return (
      cachedFilters.topNGames === topNGames &&
      cachedFilters.minPlaytime === minPlaytime &&
      cachedFilters.maxSimilarUsers === maxSimilarUsers &&
      cachedFilters.maxRecommendations === maxRecommendations &&
      cachedFilters.maxPrice === maxPrice &&
      JSON.stringify(cachedFilters.selectedGenres.sort()) === JSON.stringify(selectedGenres.sort())
    );
  };

  // Load cached data if available
  const loadFromCache = (): boolean => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const cachedData: CachedData = JSON.parse(cached);
        
        // Check if cache is for the same user
        if (cachedData.steamId !== steamId) {
          return false;
        }

        // Check if filters match
        if (!filtersMatch(cachedData.filters)) {
          return false;
        }

        // Optional: Check if cache is not too old (e.g., 30 minutes)
        const cacheAge = Date.now() - cachedData.timestamp;
        const maxCacheAge = 30 * 60 * 1000; // 30 minutes
        if (cacheAge > maxCacheAge) {
          return false;
        }

        // Load cached data
        setRecommendations(cachedData.recommendations);
        setSimilarUsers(cachedData.similarUsers);
        setStats(cachedData.stats);
        
        // Restore filter state
        setTopNGames(cachedData.filters.topNGames);
        setMinPlaytime(cachedData.filters.minPlaytime);
        setMaxSimilarUsers(cachedData.filters.maxSimilarUsers);
        setMaxRecommendations(cachedData.filters.maxRecommendations);
        setSelectedGenres(cachedData.filters.selectedGenres);
        setMaxPrice(cachedData.filters.maxPrice);
        
        setUsingCache(true);
        console.log('Loaded recommendations from cache');
        return true;
      }
    } catch (err) {
      console.error('Error loading from cache:', err);
    }
    return false;
  };

  // Save data to cache
  const saveToCache = (
    recs: GameRecommendation[],
    users: SimilarUser[],
    statsData: CachedData['stats']
  ) => {
    try {
      const cacheKey = getCacheKey();
      const dataToCache: CachedData = {
        recommendations: recs,
        similarUsers: users,
        stats: statsData,
        filters: {
          topNGames,
          minPlaytime,
          maxSimilarUsers,
          maxRecommendations,
          selectedGenres,
          maxPrice,
        },
        timestamp: Date.now(),
        steamId: steamId || '',
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
      console.log('Saved recommendations to cache');
    } catch (err) {
      console.error('Error saving to cache:', err);
    }
  };

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
      return;
    }

    if (steamId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      
      // Try to load from cache first
      const cacheLoaded = loadFromCache();
      
      if (cacheLoaded) {
        setLoading(false);
      } else {
        // No cache or cache invalid, fetch fresh data
        fetchRecommendations();
      }
    }
  }, [steamId, isLoggedIn, authLoading, router]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingCache(false);

      const maxSimilarParam = maxSimilarUsers !== 999999 ? `&max_similar_users=${maxSimilarUsers}` : '';
      const genresParam = selectedGenres.length > 0 ? selectedGenres.map(g => `&genres=${encodeURIComponent(g)}`).join('') : '';
      const maxPriceParam = maxPrice !== 'none' ? `&max_price=${maxPrice}` : '';
      
      const response = await fetch(
        `http://localhost:8000/api/collaborative-recommendations/${steamId}?top_n_games=${topNGames}&min_playtime=${minPlaytime}&max_similar_users=${maxSimilarUsers}&max_recommendations=${maxRecommendations}${genresParam}${maxPriceParam}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data: CollaborativeRecommendationsResponse = await response.json();

      if (!data.success && data.error) {
        setError(data.error);
      }

      const recs = data.recommendations || [];
      const users = data.similar_users || [];
      const statsData = {
        userTopGames: data.user_top_games || [],
        totalUsersAnalyzed: data.total_users_analyzed || 0,
        similarUsersFound: data.similar_users_found || 0,
      };

      setRecommendations(recs);
      setSimilarUsers(users);
      setStats(statsData);

      // Save to cache after successful fetch
      saveToCache(recs, users, statsData);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    // Clear the hasLoadedRef so a new request can be made
    hasLoadedRef.current = false;
    fetchRecommendations();
  };

  const handleRefreshData = () => {
    // Force a fresh fetch, bypassing cache
    setUsingCache(false);
    fetchRecommendations();
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner 
          message="Finding Your Perfect Games" 
          size="large"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Collaborative Recommendations</h1>
              <p className="text-gray-400">
                Games recommended based on users with similar gaming tastes
              </p>
            </div>
            
            {/* Cache indicator and refresh button */}
            {usingCache && (
              <div className="flex items-center gap-3">
                <div className="bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-2 flex items-center gap-2">
                  <span className="text-green-400 text-sm">💾</span>
                  <span className="text-green-300 text-sm font-medium">Loaded from cache</span>
                </div>
                <button
                  onClick={handleRefreshData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Fetch fresh recommendations"
                >
                  <span>🔄</span>
                  <span>Refresh</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-xl font-bold text-white">Recommendation Settings</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              {showFilters ? (
                <>
                  <span>Hide Settings</span>
                  <span className="transform rotate-180 transition-transform">▼</span>
                </>
              ) : (
                <>
                  <span>Show Settings</span>
                  <span>▼</span>
                </>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="space-y-6 pt-4 border-t border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Top N Games */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Top Games to Match
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Number of your top games to consider
                  </p>
                  <select
                    value={topNGames}
                    onChange={(e) => setTopNGames(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={1}>1 game</option>
                    <option value={2}>2 games</option>
                    <option value={5}>5 games</option>
                    <option value={10}>10 games</option>
                    <option value={25}>25 games</option>
                  </select>
                </div>

                {/* Min Playtime */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Minimum Playtime
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Minimum hours played to consider a game
                  </p>
                  <select
                    value={minPlaytime}
                    onChange={(e) => setMinPlaytime(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={60}>1 hour</option>
                    <option value={600}>10 hours</option>
                    <option value={6000}>100 hours</option>
                  </select>
                </div>

                {/* Max Similar Users */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Similar Users Limit
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Maximum similar users to analyze
                  </p>
                  <select
                    value={maxSimilarUsers}
                    onChange={(e) => setMaxSimilarUsers(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={999999}>No Limit</option>
                    <option value={500}>500 users</option>
                    <option value={1000}>1000 users</option>
                    <option value={10000}>10000 users</option>
                  </select>
                </div>

                {/* Max Recommendations */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Games to Recommend
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Number of game recommendations
                  </p>
                  <select
                    value={maxRecommendations}
                    onChange={(e) => setMaxRecommendations(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={3}>3 games</option>
                    <option value={5}>5 games</option>
                    <option value={10}>10 games</option>
                    <option value={20}>20 games</option>
                  </select>
                </div>
              </div>

              {/* Genre and Price Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-700/30">
                {/* Genre Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter by Genre
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select genres to filter recommendations (select multiple)
                  </p>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {availableGenres.map((genre) => (
                        <label
                          key={genre}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700/50 p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre)}
                            onChange={() => toggleGenre(genre)}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">{genre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {selectedGenres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedGenres.map((genre) => (
                        <span
                          key={genre}
                          className="bg-blue-600/30 text-blue-300 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {genre}
                          <button
                            onClick={() => toggleGenre(genre)}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Maximum Price
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Only show games under this price (USD)
                  </p>
                  <select
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="none">No Limit</option>
                    <option value="0">Free Only</option>
                    <option value="5">Under $5</option>
                    <option value="10">Under $10</option>
                    <option value="20">Under $20</option>
                    <option value="30">Under $30</option>
                    <option value="40">Under $40</option>
                    <option value="60">Under $60</option>
                  </select>
                  {maxPrice !== 'none' && (
                    <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                      <span>💰</span>
                      <span>
                        Showing games {maxPrice === '0' ? 'that are free' : `under $${maxPrice}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-end pt-4 border-t border-gray-700/50">
                <button
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Applying...
                    </span>
                  ) : (
                    'Apply Settings & Refresh'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Users Analyzed</h3>
                <p className="text-2xl font-bold">{stats.totalUsersAnalyzed}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Similar Users Found</h3>
                <p className="text-2xl font-bold">{stats.similarUsersFound}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Top Games Used</h3>
                <p className="text-2xl font-bold">{stats.userTopGames.length}</p>
              </div>
            </div>
            
            {/* Cache status footer */}
            {usingCache && (
              <div className="pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-500 italic flex items-center gap-2">
                  <span>⚡</span>
                  <span>Data loaded instantly from cache - change filters and click "Apply Settings" to fetch fresh results</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Recommendations Grid */}
        {recommendations.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Recommended Games ({recommendations.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((game) => (
                <div
                  key={game.appid}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors"
                >
                  {/* Game Image */}
                  {game.header_image && (
                    <img
                      src={game.header_image}
                      alt={game.name}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  {/* Game Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1">
                      {game.name}
                    </h3>

                    {/* Genres */}
                    {game.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {game.genres.slice(0, 3).map((genre, index) => (
                          <span
                            key={index}
                            className="bg-blue-600/30 text-blue-300 text-xs px-2 py-1 rounded"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {game.short_description || 'No description available'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="text-gray-400">
                        Recommended by{' '}
                        <span className="text-white font-semibold">
                          {game.recommended_by_count}
                        </span>{' '}
                        user{game.recommended_by_count !== 1 ? 's' : ''}
                      </div>
                      <div className="text-green-400 font-semibold">
                        {game.price}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <a
                        href={game.steam_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-center transition-colors"
                      >
                        View on Steam
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-gray-900 rounded-lg p-12 text-center">
              <p className="text-gray-400 text-lg">
                {error
                  ? 'Unable to generate recommendations at this time.'
                  : 'No recommendations available. Try playing more games or check back when more users join!'}
              </p>
            </div>
          )
        )}

        {/* Similar Users Section */}
        {similarUsers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Top 10 Similar Users</h2>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Steam ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Similarity Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Top Games Overlap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total Games Overlap
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {similarUsers.slice(0, 10).map((user, index) => (
                    <tr key={index} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.steam_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-400">
                        {user.similarity_score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.top_games_overlap}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.total_games_overlap}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
