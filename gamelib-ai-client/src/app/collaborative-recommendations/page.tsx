'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';
import AutocompleteDropdown from '../components/AutocompleteDropdown';
import GameDetailModal from '../components/GameDetailModal';

interface GameRecommendation {
  appid: number;
  name: string;
  header_image: string;
  short_description: string;
  detailed_description?: string;
  genres: string[];
  languages: string[];
  categories: string[];
  tags: string[];
  platforms: { [key: string]: boolean };
  release_date: string;
  developers: string[];
  publishers: string[];
  price: string;
  positive: number;
  negative: number;
  recommendation_score: number;
  recommended_by_count: number;
  steam_url: string;
}

interface SimilarUser {
  steam_id: number;
  persona_name: string;
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
    selectedSteamGenres: string[];
    selectedLanguages: string[];
    selectedCategories: string[];
    selectedTags: string[];
    selectedPlatforms: string[];
    minReleaseDate: string;
    maxReleaseDate: string;
    minPositiveReviews: string;
    minNegativeReviews: string;
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
  const [selectedSteamGenres, setSelectedSteamGenres] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameRecommendation | null>(null);
  const [minReleaseDate, setMinReleaseDate] = useState<string>('');
  const [maxReleaseDate, setMaxReleaseDate] = useState<string>('');
  const [minPositiveReviews, setMinPositiveReviews] = useState<string>('');
  const [minNegativeReviews, setMinNegativeReviews] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('none');
  const [showFilters, setShowFilters] = useState(false);

  // Use ref to track if initial load has been done
  const hasLoadedRef = useRef(false);

  // Fetch available tags from backend
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/tags');
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
    // Refresh tags every 30 seconds to catch new additions
    const interval = setInterval(fetchTags, 30000);
    return () => clearInterval(interval);
  }, []);

  // Available Steam genres (official Steam genres)
  const availableSteamGenres = [
    "Action",
    "Adventure",
    "Casual",
    "Indie",
    "Massively Multiplayer",
    "Racing",
    "RPG",
    "Simulation",
    "Sports",
    "Strategy",
    "Early Access",
    "Free to Play"
  ];

  // Available languages (common languages on Steam)
  const availableLanguages = [
    "English", "French", "German", "Spanish - Spain", "Spanish - Latin America",
    "Italian", "Portuguese", "Portuguese - Brazil", "Russian", "Japanese",
    "Korean", "Chinese (Simplified)", "Chinese (Traditional)", "Polish",
    "Turkish", "Arabic", "Dutch", "Swedish", "Norwegian", "Danish"
  ];

  // Available Steam categories
  const availableCategories = [
    "Single-player", "Multi-player", "MMO", "PvP",
    "Shared/Split Screen PvP", "Shared/Split Screen Co-op", "Shared/Split Screen",
    "Online PvP", "LAN PvP", "Co-op", "Online Co-op", "LAN Co-op",
    "Steam Achievements", "Full controller support", "Steam Trading Cards",
    "Captions available", "Steam Workshop", "Steam Timeline",
    "Camera Comfort", "Color Alternatives", "Custom Volume Controls",
    "Adjustable Difficulty", "Adjustable Text Size", "Playable without Timed Input",
    "Stereo Sound", "Surround Sound", "Steam Cloud",
    "Valve Anti-Cheat enabled", "Stats", "Includes Source SDK",
    "Includes level editor", "Commentary available",
    "Remote Play on Phone", "Remote Play on Tablet", "Remote Play on TV",
    "Remote Play Together", "Family Sharing",
    "Keyboard Only Option", "Mouse Only Option",
    "Save Anytime", "Subtitle Options", "Touch Only Option",
    "Partial Controller Support"
  ];

  // Available platforms
  const availablePlatforms = ["Windows", "Mac", "Linux"];

  // Available tags (fetched from backend)
  const [availableTags, setAvailableTags] = useState<string[]>([]);

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
      cachedFilters.minReleaseDate === minReleaseDate &&
      cachedFilters.maxReleaseDate === maxReleaseDate &&
      cachedFilters.minPositiveReviews === minPositiveReviews &&
      cachedFilters.minNegativeReviews === minNegativeReviews &&
      JSON.stringify(cachedFilters.selectedSteamGenres.sort()) === JSON.stringify(selectedSteamGenres.sort()) &&
      JSON.stringify(cachedFilters.selectedLanguages.sort()) === JSON.stringify(selectedLanguages.sort()) &&
      JSON.stringify(cachedFilters.selectedCategories.sort()) === JSON.stringify(selectedCategories.sort()) &&
      JSON.stringify(cachedFilters.selectedTags.sort()) === JSON.stringify(selectedTags.sort()) &&
      JSON.stringify(cachedFilters.selectedPlatforms.sort()) === JSON.stringify(selectedPlatforms.sort())
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
        setSelectedSteamGenres(cachedData.filters.selectedSteamGenres);
        setSelectedLanguages(cachedData.filters.selectedLanguages);
        setSelectedCategories(cachedData.filters.selectedCategories);
        setSelectedTags(cachedData.filters.selectedTags);
        setSelectedPlatforms(cachedData.filters.selectedPlatforms);
        setMinReleaseDate(cachedData.filters.minReleaseDate);
        setMaxReleaseDate(cachedData.filters.maxReleaseDate);
        setMinPositiveReviews(cachedData.filters.minPositiveReviews);
        setMinNegativeReviews(cachedData.filters.minNegativeReviews);
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
          selectedSteamGenres,
          selectedLanguages,
          selectedCategories,
          selectedTags,
          selectedPlatforms,
          minReleaseDate,
          maxReleaseDate,
          minPositiveReviews,
          minNegativeReviews,
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

      // Build query parameters
      const params = new URLSearchParams();
      params.append('top_n_games', topNGames.toString());
      params.append('min_playtime', minPlaytime.toString());
      params.append('max_similar_users', maxSimilarUsers.toString());
      params.append('max_recommendations', maxRecommendations.toString());
      
      // Add steam_genres
      selectedSteamGenres.forEach(genre => params.append('steam_genres', genre));
      
      // Add languages
      selectedLanguages.forEach(lang => params.append('languages', lang));
      
      // Add steam_categories
      selectedCategories.forEach(cat => params.append('steam_categories', cat));
      
      // Add tags
      selectedTags.forEach(tag => params.append('tags', tag));
      
      // Add platforms
      selectedPlatforms.forEach(platform => params.append('platforms', platform.toLowerCase()));
      
      // Add release dates
      if (minReleaseDate) params.append('min_release_date', minReleaseDate);
      if (maxReleaseDate) params.append('max_release_date', maxReleaseDate);
      
      // Add review filters
      if (minPositiveReviews) params.append('min_positive_reviews', minPositiveReviews);
      if (minNegativeReviews) params.append('min_negative_reviews', minNegativeReviews);
      
      // Add price filter
      if (maxPrice !== 'none') params.append('max_price', maxPrice);
      
      const response = await fetch(
        `http://localhost:8000/api/collaborative-recommendations/${steamId}?${params.toString()}`
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

  const toggleSteamGenre = (genre: string) => {
    setSelectedSteamGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Sort recommendations by positive reviews and limit to maxRecommendations
  const sortedRecommendations = [...recommendations]
    .sort((a, b) => (b.positive || 0) - (a.positive || 0))
    .slice(0, maxRecommendations);

  // Calculate grid columns based on number of recommendations
  const getGridColumns = () => {
    const count = recommendations.length;
    if (count === 0) return 'grid-cols-1';
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 5) return 'grid-cols-2 lg:grid-cols-2';
    if (count <= 10) return 'grid-cols-2 lg:grid-cols-2';
    if (count <= 15) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
    if (count <= 20) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
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
        <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 rounded-xl p-4 mb-6 border border-gray-700/50 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-3">
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
            <div className="space-y-6 pt-4 border-t border-gray-700/50 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <option value={100}>100 users</option>
                    <option value={250}>250 users</option>
                    <option value={500}>500 users</option>
                    <option value={1000}>1000 users</option>
                    <option value={2500}>2500 users</option>
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

              {/* Advanced Filters Section */}
              <div className="space-y-4 pt-4 border-t border-gray-700/30">
                
                {/* Steam Genres, Languages, Categories, Tags - Using Autocomplete Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Steam Genres Filter */}
                  <AutocompleteDropdown
                    label="Filter by Steam Genre"
                    description="Official Steam genres (select multiple)"
                    options={availableSteamGenres}
                    selectedValues={selectedSteamGenres}
                    onToggle={toggleSteamGenre}
                    placeholder="Select genres..."
                    tagColor="blue"
                  />

                  {/* Languages Filter */}
                  <AutocompleteDropdown
                    label="Filter by Language"
                    description="Game language support (select multiple)"
                    options={availableLanguages}
                    selectedValues={selectedLanguages}
                    onToggle={toggleLanguage}
                    placeholder="Select languages..."
                    tagColor="green"
                  />

                  {/* Steam Categories Filter */}
                  <AutocompleteDropdown
                    label="Filter by Steam Category"
                    description="Game features and modes (select multiple)"
                    options={availableCategories}
                    selectedValues={selectedCategories}
                    onToggle={toggleCategory}
                    placeholder="Select categories..."
                    tagColor="purple"
                  />

                  {/* Tags Filter */}
                  <AutocompleteDropdown
                    label="Filter by Tags"
                    description="SteamSpy tags (live updated)"
                    options={availableTags}
                    selectedValues={selectedTags}
                    onToggle={toggleTag}
                    placeholder="Select tags..."
                    tagColor="blue"
                  />
                </div>

                {/* Bottom row: Platforms, Release Date, Reviews, Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Platforms Filter - Autocomplete Dropdown */}
                  <AutocompleteDropdown
                    label="Filter by Platform"
                    description="Operating system compatibility"
                    options={availablePlatforms}
                    selectedValues={selectedPlatforms}
                    onToggle={togglePlatform}
                    placeholder="Select platforms..."
                    tagColor="blue"
                  />

                  {/* Release Date Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Release Date Range
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Filter games by release date
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">From:</label>
                        <input
                          type="date"
                          value={minReleaseDate}
                          onChange={(e) => setMinReleaseDate(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">To:</label>
                        <input
                          type="date"
                          value={maxReleaseDate}
                          onChange={(e) => setMaxReleaseDate(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Review Filters */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Reviews
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Filter by review counts
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Positive (min):</label>
                        <input
                          type="number"
                          value={minPositiveReviews}
                          onChange={(e) => setMinPositiveReviews(e.target.value)}
                          placeholder="e.g., 1000"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Negative (min):</label>
                        <input
                          type="number"
                          value={minNegativeReviews}
                          onChange={(e) => setMinNegativeReviews(e.target.value)}
                          placeholder="e.g., 100"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Price
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Only show games under this price (USD)
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Max Price ($):</label>
                        <input
                          type="text"
                          value={maxPrice === 'none' ? '' : maxPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow empty, 'none', or valid numbers (including decimals)
                            if (value === '' || value === 'none') {
                              setMaxPrice('none');
                            } else if (/^\d*\.?\d*$/.test(value)) {
                              setMaxPrice(value);
                            }
                          }}
                          placeholder="e.g., 9.99 or leave empty"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {maxPrice === 'none' || maxPrice === '' ? (
                          <span>No price limit</span>
                        ) : (
                          <span className="text-green-400 flex items-center gap-1">
                            <span>💰</span>
                            <span>Max: ${maxPrice}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
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
          <div className="bg-gray-900 rounded-lg p-4 mb-6 transition-all duration-300 hover:shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Top {sortedRecommendations.length} Games (by Positive Reviews)
              </h2>
            </div>
            <div className={`grid ${getGridColumns()} gap-4 transition-all duration-300`}>
              {sortedRecommendations.map((game) => (
                <div
                  key={game.appid}
                  onClick={() => setSelectedGame(game)}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
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

                    {/* Reviews */}
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-green-400">▲</span>
                        <span className="text-gray-400">{(game.positive || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-400">▼</span>
                        <span className="text-gray-400">{(game.negative || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm mb-4">
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
                        onClick={(e) => e.stopPropagation()}
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
          <div className="mt-8 animate-fadeIn">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Top 10 Similar Users</h2>
              <p className="text-gray-400 text-sm">
                These users have the most similar gaming preferences to you. Similarity is calculated based on:
                <span className="block mt-1 ml-4">
                  • <strong>Top Games Overlap:</strong> Number of your favorite games they also play (weighted 10x)
                </span>
                <span className="block ml-4">
                  • <strong>Total Games Overlap:</strong> Total number of games you both own
                </span>
                <span className="block mt-1 text-xs text-gray-500">
                  Similarity Score = (Top Games Overlap × 10) + Total Games Overlap
                </span>
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Steam Name
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
                    <tr key={index} className="hover:bg-gray-800/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={`https://steamcommunity.com/id/${user.persona_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        >
                          {user.persona_name}
                        </a>
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

      {/* Game Detail Modal */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </main>
  );
}
