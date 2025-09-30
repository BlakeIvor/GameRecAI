"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  console.log('=== LOGIN PAGE LOADED ===');
  const [error, setError] = useState<string | null>(null);
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
    console.log('=== STEAM LOGIN BUTTON CLICKED ===');
    console.log('Redirecting to: http://localhost:8000/api/auth/steam/login');
    
    // First test if backend is reachable
    try {
      console.log('Testing backend connectivity...');
      const response = await fetch('http://localhost:8000/', { method: 'GET' });
      console.log('Backend test response:', response.status, response.ok);
      console.log('Response text:', await response.text());
      
      if (!response.ok) {
        alert('Backend server not responding properly. Please check if it\'s running on port 8000.');
        return;
      }
      
      console.log('Backend is reachable, proceeding with Steam redirect...');
      window.location.href = "http://localhost:8000/api/auth/steam/login";
      
    } catch (error) {
      console.error('Backend connectivity test failed:', error);
      alert('Cannot reach backend server. Please make sure it\'s running on port 8000.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black flex-col gap-8">
      <h1 className="text-white text-3xl font-bold">Login to GameLib.Ai</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
          {error}
        </div>
      )}
      
      <button
        onClick={handleSteamLogin}
        onMouseDown={() => console.log('Button mouse down')}
        onMouseUp={() => console.log('Button mouse up')}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Sign in with Steam
      </button>
      
      {/* Backup test button */}
      <button
        onClick={() => {
          console.log('BACKUP BUTTON CLICKED');
          alert('Backup button works!');
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test Button (Debug)
      </button>
      
      <div className="text-gray-400 text-sm max-w-md text-center">
        You'll be redirected to Steam to authenticate, then brought back here.
      </div>
    </main>
  );
}
