'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
      return;
    }

    if (steamId) {
      fetchRecommendations();
    }
  }, [steamId, isLoggedIn, authLoading, router]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:8000/api/collaborative-recommendations/${steamId}?top_n_games=5&min_playtime=60&max_similar_users=10&max_recommendations=20`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data: CollaborativeRecommendationsResponse = await response.json();

      if (!data.success && data.error) {
        setError(data.error);
      }

      setRecommendations(data.recommendations || []);
      setSimilarUsers(data.similar_users || []);
      setStats({
        userTopGames: data.user_top_games || [],
        totalUsersAnalyzed: data.total_users_analyzed || 0,
        similarUsersFound: data.similar_users_found || 0,
      });
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white text-xl">Loading recommendations...</div>
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
          <h1 className="text-4xl font-bold mb-2">Collaborative Recommendations</h1>
          <p className="text-gray-400">
            Games recommended based on users with similar gaming tastes
          </p>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <h2 className="text-2xl font-bold mb-6">Similar Users</h2>
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
                  {similarUsers.map((user, index) => (
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
