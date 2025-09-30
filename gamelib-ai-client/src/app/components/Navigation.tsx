'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { steamId, isLoggedIn, logout, loading } = useAuth();

  const handleLogout = () => {
    console.log('Navigation logout clicked');
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          GameLib.AI
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
          <Link href="/recommendations" className="hover:text-gray-300">
            Recommendations
          </Link>
          <Link href="/about" className="hover:text-gray-300">
            About
          </Link>
          <Link href="/contact" className="hover:text-gray-300">
            Contact
          </Link>
          
          {!loading && isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Steam: {steamId}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}