"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

function LoginContent() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error params from auth callback
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    const statusParam = searchParams.get('status');
    
    if (errorParam) {
      let errorMessage = 'Authentication failed';
      switch (errorParam) {
        case 'no_claimed_id':
          errorMessage = 'Steam authentication failed: No user ID returned';
          break;
        case 'openid_failed':
          errorMessage = `OpenID authentication failed (Status: ${statusParam})`;
          break;
        case 'exception':
          errorMessage = `Error: ${messageParam}`;
          break;
      }
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleSteamLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check backend connectivity
      const response = await fetch('http://localhost:8000/', { method: 'GET' });
      
      if (!response.ok) {
        setError('Backend server not responding. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      // Redirect to Steam login
      window.location.href = "http://localhost:8000/api/auth/steam/login";
      
    } catch (err) {
      setError('Cannot reach authentication server. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl top-20 left-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-20 right-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              GameLib.AI
            </h1>
            <p className="text-gray-400 text-lg mb-2">Smart Game Discovery Platform</p>
            <p className="text-gray-500 text-sm">Powered by AI & Community Intelligence</p>
          </div>

          {/* Login Card */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400 text-sm">Sign in with your Steam account to continue</p>
              </div>

              {/* Steam Login Button */}
              <button
                onClick={handleSteamLogin}
                disabled={isLoading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <span className="relative flex items-center justify-center space-x-3">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                      </svg>
                      <span className="text-lg">Sign in with Steam</span>
                    </>
                  )}
                </span>
              </button>

              {/* Info Text */}
              <div className="text-center space-y-3">
                <p className="text-gray-500 text-xs">
                  You&apos;ll be securely redirected to Steam to authenticate
                </p>
                
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Fast</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                About
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
              <span className="text-gray-700">•</span>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                GitHub
              </a>
            </div>
            <p className="text-gray-600 text-xs">
              © 2025 GameLib.AI - Discover your next favorite game
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginContent />
    </Suspense>
  );
}
