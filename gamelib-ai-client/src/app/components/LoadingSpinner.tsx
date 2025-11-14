import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'large' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-40 h-40'
  };

  const messageSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      {/* Animated Gaming Controller with Glowing Effect */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 glow-pulse"></div>
        
        {/* Rotating outer ring */}
        <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full loading-spinner"></div>
        
        {/* Inner spinning icon - Gaming D-pad style */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="gear-spin w-2/3 h-2/3 text-blue-400"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gaming Controller D-pad design */}
            <g transform="translate(50, 50)">
              {/* Center circle */}
              <circle cx="0" cy="0" r="12" fill="currentColor" opacity="0.9" />
              
              {/* D-pad buttons */}
              <rect x="-6" y="-30" width="12" height="18" rx="3" fill="currentColor" opacity="0.8" />
              <rect x="-6" y="12" width="12" height="18" rx="3" fill="currentColor" opacity="0.8" />
              <rect x="-30" y="-6" width="18" height="12" rx="3" fill="currentColor" opacity="0.8" />
              <rect x="12" y="-6" width="18" height="12" rx="3" fill="currentColor" opacity="0.8" />
              
              {/* Corner accents */}
              <circle cx="20" cy="-20" r="4" fill="currentColor" opacity="0.6" />
              <circle cx="-20" cy="-20" r="4" fill="currentColor" opacity="0.6" />
              <circle cx="20" cy="20" r="4" fill="currentColor" opacity="0.6" />
              <circle cx="-20" cy="20" r="4" fill="currentColor" opacity="0.6" />
            </g>
          </svg>
        </div>
      </div>

      {/* Loading text with pulse animation */}
      <div className="text-center space-y-3">
        <p className={`${messageSizes[size]} font-semibold text-gray-200 loading-pulse`}>
          {message}
        </p>
        
        {/* Animated dots */}
        <div className="flex items-center justify-center space-x-2">
          <div 
            className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" 
            style={{ animationDelay: '0ms', animationDuration: '1s' }}
          ></div>
          <div 
            className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" 
            style={{ animationDelay: '200ms', animationDuration: '1s' }}
          ></div>
          <div 
            className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" 
            style={{ animationDelay: '400ms', animationDuration: '1s' }}
          ></div>
        </div>
      </div>

      {/* Fun loading tip - only show for medium and large */}
      {(size === 'medium' || size === 'large') && (
        <div className="text-sm text-gray-400 italic max-w-md text-center px-4">
          <p className="loading-pulse">
            {size === 'large' 
              ? 'Analyzing your gaming preferences and finding similar players...'
              : 'Processing your request...'
            }
          </p>
        </div>
      )}
    </div>
  );
}
