'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface GameRecommendation {
  name: string;
  app_id: number;
  steam_appid: number;
  description: string;
  steam_url: string;
  price?: string;
  genres?: string[];
  developers?: string[];
  publishers?: string[];
  release_date?: string;
  image?: string;
}

interface AIResponse {
  message: string;
  prompt: string;
  recommendations: GameRecommendation[];
  explanation: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  recommendations?: GameRecommendation[];
  explanation?: string;
  loading?: boolean;
}

export default function AIChatPage() {
  const { steamId, isLoggedIn, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current && isLoggedIn) {
      inputRef.current.focus();
    }
  }, [isLoggedIn]);

  // Add initial welcome message
  useEffect(() => {
    if (isLoggedIn && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: "🎮 Welcome to AI Game Chat! I'm here to help you discover amazing games tailored to your preferences. Tell me what you're in the mood for - whether it's a specific genre, budget, gameplay style, or even games similar to ones you love. Let's find your next gaming adventure!",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isLoggedIn, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: `ai-loading-${Date.now()}`,
      type: 'ai',
      content: 'Thinking...',
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/recommendations/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          steam_id: steamId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendations');
      }

      const data: AIResponse = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.explanation,
        timestamp: new Date(),
        recommendations: data.recommendations,
        explanation: data.explanation
      };

      // Remove loading message and add AI response
      setMessages(prev => prev.slice(0, -1).concat(aiMessage));
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      const errorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        type: 'ai',
        content: 'Sorry, I encountered an error while getting recommendations. Please try again.',
        timestamp: new Date()
      };

      // Remove loading message and add error message
      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string | undefined): string => {
    if (!price) return 'Price not available';
    if (price.toLowerCase() === 'free' || price.toLowerCase() === 'free to play') return 'Free to Play';
    return price;
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  if (!isLoggedIn) {
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
            You need to be logged in with your Steam account to use the AI chat feature.
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Game Chat
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Chat with our AI assistant to discover your perfect next game
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl border border-gray-700/50 overflow-hidden shadow-xl">
          {/* Messages */}
          <div className="h-[60vh] overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-full sm:max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-xl p-4 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-4 sm:ml-8'
                        : 'bg-gray-900/50 text-gray-100 mr-4 sm:mr-8 border border-gray-700/30'
                    }`}
                  >
                    {message.loading ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner />
                        <span>Analyzing your request...</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                    )}
                  </div>

                  {/* Game Recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="text-sm text-blue-400 font-semibold mb-4 mr-4 sm:mr-8">
                        🎯 Recommended Games
                      </div>
                      {message.recommendations.map((game) => (
                        <div
                          key={game.app_id}
                          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-gray-700/50 p-4 hover:from-gray-850 hover:to-gray-750 transition-all duration-300 group mr-4 sm:mr-8"
                        >
                          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                            {game.image && (
                              <div className="relative overflow-hidden rounded-lg">
                                <img
                                  src={game.image}
                                  alt={game.name}
                                  className="w-full sm:w-20 h-32 sm:h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 w-full">
                              <div className="flex flex-col sm:flex-row items-start justify-between mb-2">
                                <h3 className="text-lg font-semibold text-white mb-1 sm:mb-0 group-hover:text-blue-400 transition-colors">{game.name}</h3>
                                {game.price && (
                                  <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium self-start sm:ml-2 border border-green-600/30">
                                    {formatPrice(game.price)}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{game.description}</p>
                              
                              {game.genres && game.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {game.genres.slice(0, 3).map((genre) => (
                                    <span key={genre} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs border border-blue-600/30">
                                      {genre}
                                    </span>
                                  ))}
                                  {game.genres.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-700/50 text-gray-400 rounded text-xs">
                                      +{game.genres.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-4 mt-4">
                                <a
                                  href={game.steam_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                                >
                                  <span className="mr-2">🎮</span>
                                  View on Steam
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2 mr-4 sm:mr-8">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-700/50 bg-gray-900/30 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me for game recommendations... (e.g., 'I want a shooter game under $20 with mechs and multiplayer!')"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-gray-400 text-sm sm:text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 self-stretch sm:self-auto"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  'Send'
                )}
              </button>
            </form>
            <div className="mt-3 text-xs text-gray-500">
              For best results, ask about key elements such as <span className="text-blue-400">game plot</span>, <span className="text-blue-400">game price</span>, or <span className="text-blue-400">game genre</span>.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}