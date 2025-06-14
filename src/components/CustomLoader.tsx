
import React from 'react';

interface CustomLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const CustomLoader: React.FC<CustomLoaderProps> = ({ 
  message = "Loading...", 
  fullScreen = true 
}) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 bg-black flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-6">
        {/* Logo with pulsing animation */}
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-red-600 animate-pulse">
            Hem's Flix
          </h1>
        </div>

        {/* Custom loading animation */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-gray-800 border-t-red-600 rounded-full animate-spin"></div>
          
          {/* Inner dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>

        {/* Loading message */}
        <p className="text-white text-lg font-medium animate-pulse">
          {message}
        </p>

        {/* Progress bar animation */}
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
