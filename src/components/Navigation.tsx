
import React, { useState } from 'react';
import { Search, Menu, User, Home, Film, Bookmark, LogOut, UserCog, Tv, PlaySquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
  const { userData } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <h1 
            className="text-2xl font-bold text-red-600 cursor-pointer"
            onClick={() => navigate('/')}
          >
            Hem's Flix
          </h1>
          
          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button 
              onClick={() => navigate('/movies')}
              className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <Film className="w-4 h-4" />
              Movies
            </button>
            <button 
              onClick={() => navigate('/series')}
              className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <PlaySquare className="w-4 h-4" />
              Series
            </button>
            <button 
              onClick={() => navigate('/anime')}
              className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <Tv className="w-4 h-4" />
              Anime
            </button>
            <button 
              onClick={() => navigate('/mylist')}
              className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              My List
            </button>
            {userData?.isAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
              >
                <UserCog className="w-4 h-4" />
                Admin Panel
              </button>
            )}
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
                className="transition-colors"
              >
                <Avatar className={`w-10 h-10 ${userData?.profileImage ? 'border-0' : 'border-2 border-red-600'} hover:border-red-500`}>
                  <AvatarImage 
                    src={userData?.profileImage} 
                    alt={userData?.name || 'Profile'}
                  />
                  <AvatarFallback className="bg-red-600 text-white">
                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-white font-semibold">{userData?.name || currentUser?.name || 'User'}</p>
                    <p className="text-gray-400 text-sm">{userData?.email || currentUser?.email || 'user@example.com'}</p>
                    {userData?.isAdmin && (
                      <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded mt-1">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
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
