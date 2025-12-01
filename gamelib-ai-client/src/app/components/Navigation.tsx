'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const { steamId, steamName, isLoggedIn, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Ensure we only render the active state on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    console.log('Navigation logout clicked');
    logout();
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    // Always use pathname for consistency between server and client
    return pathname === path;
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🎮' },
    //{ href: '/recommendations', label: 'AI Recommendations', icon: '🤖' },
    { href: '/ai-recommendations', label: 'AI Chat', icon: '💬' },
    { href: '/collaborative-recommendations', label: 'Community Picks', icon: '👥' },
    { href: '/about', label: 'About', icon: '📖' },
    { href: '/contact', label: 'Contact', icon: '📞' },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-white border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* Logo Icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-blue-500 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
                GameLib.AI
              </span>
              <span className="text-xs text-gray-400 font-medium">Smart Game Discovery</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${isActive(link.href)
                    ? 'text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }
                  group overflow-hidden
                `}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content */}
                <span className="relative flex items-center space-x-2">
                  <span className="text-base group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                  <span>{link.label}</span>
                </span>

                {/* Active indicator */}
                {isActive(link.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {mounted && !loading && isLoggedIn ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {steamName || `User ${steamId?.slice(0, 8)}`}
                    </span>
                    <span className="text-xs text-gray-400">Steam Connected</span>
                  </div>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="
                    relative px-4 py-2 rounded-lg text-sm font-medium
                    bg-red-600/10 text-red-400 border border-red-600/50
                    hover:bg-red-600 hover:text-white hover:border-red-500
                    transition-all duration-300
                    transform hover:scale-105
                    group overflow-hidden
                  "
                >
                  {/* Animated background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/50 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <span className="relative flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </span>
                </button>
              </>
            ) : mounted && !loading ? (
              <Link 
                href="/login"
                className="
                  relative px-6 py-2 rounded-lg text-sm font-medium
                  bg-gradient-to-r from-blue-600 to-purple-600
                  hover:from-blue-700 hover:to-purple-700
                  text-white
                  transition-all duration-300
                  transform hover:scale-105
                  shadow-lg hover:shadow-blue-500/50
                  group overflow-hidden
                "
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <span className="relative flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login with Steam</span>
                </span>
              </Link>
            ) : (
              <div className="w-24 h-10 bg-gray-800/50 rounded-lg animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Mobile Navigation (shown on small screens) */}
        <div className="lg:hidden flex items-center space-x-2 overflow-x-auto pb-3 pt-2 scrollbar-hide">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300
                ${isActive(link.href)
                  ? 'text-white bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }
              `}
            >
              <span className="flex items-center space-x-1.5">
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}