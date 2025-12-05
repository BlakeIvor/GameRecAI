'use client';

import { useEffect } from 'react';

interface GameDetailModalProps {
  game: {
    game_id: number;
    name: string;
    header_image: string;
    short_description: string;
    genres: string[];
    languages: string[];
    categories: string[];
    tags: string[];
    platforms: { [key: string]: boolean };
    release_date: string;
    developers: string[];
    publishers: string[];
    positive: number;
    negative: number;
    price: string;
    steam_url: string;
    recommended_by_count: number;
  };
  onClose: () => void;
}

export default function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const totalReviews = (game.positive || 0) + (game.negative || 0);
  const positivePercentage = totalReviews > 0
    ? Math.round(((game.positive || 0) / totalReviews) * 100)
    : 0;

  const activePlatforms = Object.entries(game.platforms || {})
    .filter(([_, active]) => active)
    .map(([platform]) => platform.charAt(0).toUpperCase() + platform.slice(1));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        {game.header_image && (
          <div className="relative">
            <img
              src={game.header_image}
              alt={game.name}
              className="w-full h-48 object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 hover:bg-opacity-100 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Title and Price */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-3xl font-bold">{game.name}</h2>
            <div className="text-2xl font-bold text-green-400 whitespace-nowrap">
              {game.price}
            </div>
          </div>

          {/* Description */}
          {(game.short_description) && (
            <div className="text-gray-300 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: game.short_description }} />
            </div>
          )}

          {/* Review Statistics */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Reviews</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-gray-400 text-sm">Positive</div>
                <div className="text-xl font-bold text-green-400">
                  {(game.positive || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Negative</div>
                <div className="text-xl font-bold text-red-400">
                  {(game.negative || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Total</div>
                <div className="text-xl font-bold">
                  {totalReviews.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Rating</div>
                <div className="text-xl font-bold text-blue-400">
                  {totalReviews > 0 ? `${positivePercentage}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
            <p className="text-gray-300">
              Recommended by{' '}
              <span className="text-white font-bold">{game.recommended_by_count}</span>{' '}
              similar user{game.recommended_by_count !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {game.tags && game.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {game.categories && game.categories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {game.categories.map((category, idx) => (
                  <span
                    key={idx}
                    className="bg-green-600/30 text-green-300 px-3 py-1 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Game Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Release Date */}
            {game.release_date && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Release Date</h3>
                <p className="text-white">{game.release_date}</p>
              </div>
            )}

            {/* Platforms */}
            {activePlatforms.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Platforms</h3>
                <p className="text-white">{activePlatforms.join(', ')}</p>
              </div>
            )}

            {/* Developers */}
            {game.developers && game.developers.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Developers</h3>
                <p className="text-white">{game.developers.join(', ')}</p>
              </div>
            )}

            {/* Publishers */}
            {game.publishers && game.publishers.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Publishers</h3>
                <p className="text-white">{game.publishers.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Languages */}
          {game.languages && game.languages.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Supported Languages</h3>
              <p className="text-gray-300">{game.languages.join(', ')}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <a
              href={game.steam_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
            >
              View on Steam
            </a>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}