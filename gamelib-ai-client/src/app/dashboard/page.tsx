'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface SteamPlayerData {
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
}

interface GameData {
  playtime_forever: number;
  rtime_last_played?: number;
}

interface ProfileData {
  totalGames: number;
  topGames: Array<{
    appid: number;
    playtime_forever: number;
    rtime_last_played?: number;
    name?: string;
    image?: string;
  }>;
  playerSummary: SteamPlayerData | null;
}

interface CachedProfileData {
  data: ProfileData;
  timestamp: number;
  steamId: string;
}

function DashboardContent() {
  const { steamId, steamName, isLoggedIn, login, loading } = useAuth();
  const searchParams = useSearchParams();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Cache key for localStorage
  const getCacheKey = () => `dashboard_profile_${steamId}`;

  // Load cached profile data
  const loadFromCache = (): boolean => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const cachedData: CachedProfileData = JSON.parse(cached);
        
        // Check if cache is for the same user
        if (cachedData.steamId !== steamId) {
          return false;
        }

        // Check if cache is not too old (e.g., 15 minutes)
        const cacheAge = Date.now() - cachedData.timestamp;
        const maxCacheAge = 15 * 60 * 1000; // 15 minutes
        if (cacheAge > maxCacheAge) {
          return false;
        }

        // Load cached data
        setProfileData(cachedData.data);
        console.log('Loaded dashboard profile from cache');
        return true;
      }
    } catch (err) {
      console.error('Error loading dashboard cache:', err);
    }
    return false;
  };

  // Save profile data to cache
  const saveToCache = (data: ProfileData) => {
    try {
      const cacheKey = getCacheKey();
      const dataToCache: CachedProfileData = {
        data,
        timestamp: Date.now(),
        steamId: steamId || '',
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
      console.log('Saved dashboard profile to cache');
    } catch (err) {
      console.error('Error saving dashboard cache:', err);
    }
  };

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

  // Fetch Steam profile data when user is logged in
  useEffect(() => {
    if (steamId && isLoggedIn && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      
      // Try to load from cache first
      const cacheLoaded = loadFromCache();
      
      if (!cacheLoaded) {
        // No cache or cache invalid, fetch fresh data
        fetchSteamProfileData();
      }
    }
  }, [steamId, isLoggedIn]);

  const fetchSteamProfileData = async () => {
    if (!steamId) return;

    console.log('Starting fetchSteamProfileData for steamId:', steamId);
    setProfileLoading(true);
    try {
      console.log('Making API calls to backend...');
      
      // Fetch both profile and player summary data
      const [profileResponse, playerResponse] = await Promise.all([
        fetch(`http://localhost:8000/api/steam/profile/${steamId}`),
        fetch(`http://localhost:8000/api/steam/player/${steamId}`)
      ]);

      console.log('Profile response status:', profileResponse.status);
      console.log('Player response status:', playerResponse.status);

      let profileData = null;
      let playerData = null;

      if (profileResponse.ok) {
        const profileResult = await profileResponse.json();
        console.log('Profile data received:', profileResult);
        profileData = profileResult;
      } else {
        const errorText = await profileResponse.text();
        console.error('Profile fetch failed:', errorText);
      }

      if (playerResponse.ok) {
        const playerResult = await playerResponse.json();
        console.log('Player data received:', playerResult);
        playerData = playerResult;
      } else {
        const errorText = await playerResponse.text();
        console.error('Player fetch failed:', errorText);
      }

      if (profileData && profileData.games) {
        console.log('Games data found:', Object.keys(profileData.games).length, 'games');
        
        // Convert games object to array and sort by playtime
        const gamesArray = Object.entries(profileData.games).map(([appid, gameData]) => ({
          appid: parseInt(appid),
          ...(gameData as GameData)
        }));

        console.log('Games array sample:', gamesArray.slice(0, 5));

        // Sort by playtime and get top 5
        const topGames = gamesArray
          .sort((a, b) => b.playtime_forever - a.playtime_forever)
          .slice(0, 5);

        console.log('Top 5 games by playtime:', topGames);

        // Get game names and images for top games from backend
        const topGamesWithNames = await Promise.all(
          topGames.map(async (game) => {
            try {
              console.log(`Fetching details for game ${game.appid}...`);
              const gameDetailsResponse = await fetch(`http://localhost:8000/api/steam/game-details/${game.appid}`);
              console.log(`Game details response status for ${game.appid}:`, gameDetailsResponse.status);
              
              if (gameDetailsResponse.ok) {
                const gameDetails = await gameDetailsResponse.json();
                console.log(`Game details for ${game.appid}:`, gameDetails);
                
                // Backend returns Game schema with proper field names
                return { 
                  ...game, 
                  name: gameDetails.name || `Game ${game.appid}`,
                  image: gameDetails.header_image || gameDetails.image || null
                };
              } else {
                const errorText = await gameDetailsResponse.text();
                console.error(`Failed to fetch details for game ${game.appid}:`, errorText);
              }
            } catch (error) {
              console.error(`Error fetching game details for ${game.appid}:`, error);
            }
            return { ...game, name: `Game ${game.appid}`, image: null };
          })
        );

        console.log('Final games with names:', topGamesWithNames);

        const finalProfileData = {
          totalGames: gamesArray.length,
          topGames: topGamesWithNames,
          playerSummary: playerData
        };

        setProfileData(finalProfileData);
        
        // Save to cache after successful fetch
        saveToCache(finalProfileData);
      } else {
        console.error('No games data found in profile response');
      }
    } catch (error) {
      console.error('Failed to fetch Steam profile data:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()} hrs`;
  };

  const getOnlineStatus = (personastate: number) => {
    const states = {
      0: { status: 'Offline', color: 'bg-gray-500' },
      1: { status: 'Online', color: 'bg-green-500' },
      2: { status: 'Busy', color: 'bg-red-500' },
      3: { status: 'Away', color: 'bg-yellow-500' },
      4: { status: 'Snooze', color: 'bg-yellow-500' },
      5: { status: 'Looking to trade', color: 'bg-blue-500' },
      6: { status: 'Looking to play', color: 'bg-green-500' }
    };
    return states[personastate as keyof typeof states] || states[0];
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 to-black">
        <LoadingSpinner 
          message="Loading Your Dashboard" 
          size="large"
        />
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
        </div>

        {/* Enhanced Profile Section */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 rounded-xl p-8 mb-8 border border-gray-600/50 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="relative">
              {/* Steam Profile Picture - fetched from Steam API */}
              <img 
                src={profileData?.playerSummary?.avatarfull || `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg`}
                alt={`${steamName || 'User'}'s Steam Avatar`}
                className="w-16 h-16 rounded-full border-2 border-blue-500"
                onError={(e) => {
                  // Fallback to default avatar if Steam avatar fails to load
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM0Yjc2ODgiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iY3VycmVudENvbG9yIj4KICA8cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xNS43NSA2YTMuNzUgMy43NSAwIDEgMS03LjUgMCAzLjc1IDMuNzUgMCAwIDEgNy41IDBaTTQuNTAxIDIwLjExOGE3LjUgNy41IDAgMCAxIDE0Ljk5OCAwQTEuNDcgMS40NyAwIDAgMSAxOC40NjEgMjJIOS4zOWExLjQ3IDEuNDcgMCAwIDEtMS4zNjktMS44ODJaIiAvPgo8L3N2Zz4KICA8L3N2Zz4KPC9zdmc+';
                }}
              />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${profileData?.playerSummary ? getOnlineStatus(profileData.playerSummary.personastate).color : 'bg-green-500'}`}></div>
            </div>
            <div className="ml-4">
              <h2 className="text-3xl font-bold text-white mb-1">
                Welcome back, {profileData?.playerSummary?.personaname || steamName || 'Gamer'}!
              </h2>
              <p className="text-blue-300 font-medium">Ready to discover your next favorite game?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
              <h3 className="text-blue-400 font-semibold mb-3 text-sm uppercase tracking-wide">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Steam ID:</span>
                  <span className="text-white font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                    {steamId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Games Owned:</span>
                  <span className="text-white text-sm font-medium">
                    {profileLoading ? (
                      <span className="inline-block bg-gray-700 h-5 w-12 rounded animate-pulse"></span>
                    ) : profileData ? (
                      profileData.totalGames
                    ) : (
                      <span className="inline-block bg-gray-700 h-5 w-12 rounded animate-pulse"></span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Profile Status:</span>
                  <span className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${profileData?.playerSummary ? getOnlineStatus(profileData.playerSummary.personastate).color : 'bg-green-400'}`}></div>
                    <span className={`text-sm font-medium ${profileData?.playerSummary ? 'text-' + getOnlineStatus(profileData.playerSummary.personastate).color.replace('bg-', '') : 'text-green-400'}`}>
                      {profileData?.playerSummary ? getOnlineStatus(profileData.playerSummary.personastate).status : 'Online'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
              <h3 className="text-green-400 font-semibold mb-3 text-sm uppercase tracking-wide">Top Games</h3>
              <div className="space-y-3 min-h-[180px]">
                {(() => {
                  console.log('Top Games Render - profileLoading:', profileLoading);
                  console.log('Top Games Render - profileData:', profileData);
                  console.log('Top Games Render - topGames:', profileData?.topGames);
                  console.log('Top Games Render - topGames length:', profileData?.topGames?.length);
                  return null;
                })()}
                {profileLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={`skeleton-${i}`} className="flex items-center justify-between animate-pulse">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-700 rounded mr-2"></div>
                          <div className="h-4 bg-gray-700 rounded w-32"></div>
                        </div>
                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : profileData && profileData.topGames && profileData.topGames.length > 0 ? (
                  profileData.topGames.slice(0, 5).map((game) => (
                    <div key={game.appid} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-700 rounded mr-2 flex items-center justify-center overflow-hidden">
                          {game.image ? (
                            <img 
                              src={game.image} 
                              alt={game.name || `Game ${game.appid}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to game controller emoji if image fails
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<span class="text-xs">🎮</span>';
                                }
                              }}
                            />
                          ) : (
                            <span className="text-xs">🎮</span>
                          )}
                        </div>
                        <span className="text-white text-sm">{game.name || `Game ${game.appid}`}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{formatPlaytime(game.playtime_forever)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2">
                    <span className="text-gray-500 text-xs">
                      {!profileData ? 'Loading profile data...' : 'No game data available'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
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

          <Link 
            href="/collaborative-recommendations" 
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-8 rounded-xl block transition-all duration-300 group shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">👥</span>
              <h3 className="text-2xl font-bold text-white">Community Picks</h3>
            </div>
            <p className="text-purple-100 leading-relaxed">
              Discover games loved by players with similar tastes. See what users like you are playing and enjoying.
            </p>
            <div className="mt-4 text-purple-200 text-sm flex items-center">
              <span>View community recommendations</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-8 rounded-xl border border-gray-700/50">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">🚀</span>
              <h3 className="text-2xl font-bold text-gray-300">Profile Management</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {profileLoading ? 'Syncing your Steam profile data...' : 'Your Steam profile is synchronized and ready for AI recommendations.'}
            </p>
            <div className="mt-4">
              <button
                onClick={fetchSteamProfileData}
                disabled={profileLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {profileLoading ? 'Syncing...' : 'Refresh Profile'}
              </button>
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}
