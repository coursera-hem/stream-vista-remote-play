
import React, { useState } from 'react';
import { Search, Menu, User, Home, Film, Bookmark, LogOut } from 'lucide-react';

interface NavigationProps {
  onSearch: () => void;
  onLogin: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  currentUser?: { name: string; email: string };
}

export const Navigation: React.FC<NavigationProps> = ({
  onSearch,
  onLogin,
  isLoggedIn,
  onLogout,
  currentUser
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-red-600">StreamFlix</h1>
          
          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-white hover:text-gray-300 transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors flex items-center gap-2">
              <Film className="w-4 h-4" />
              Movies
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              My List
            </a>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Search button */}
          <button
            onClick={onSearch}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <Search className="w-5 h-5 text-white" />
          </button>

          {/* User menu */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
              >
                <User className="w-5 h-5 text-white" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-white font-semibold">{currentUser?.name || 'User'}</p>
                    <p className="text-gray-400 text-sm">{currentUser?.email || 'user@example.com'}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </button>
          )}

          {/* Mobile menu */}
          <button className="md:hidden w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </nav>
  );
};
