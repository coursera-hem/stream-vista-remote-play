
import React, { useState } from 'react';
import { Search, Menu, User, Home, Film, Bookmark, LogOut, UserCog, Tv, PlaySquare, X } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    if (userData?.isAdmin) {
      navigate('/admin');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/', id: 'home' },
    { icon: Film, label: 'Movies', path: '/movies', id: 'movies' },
    { icon: PlaySquare, label: 'Series', path: '/series', id: 'series' },
    { icon: Tv, label: 'Anime', path: '/anime', id: 'anime' },
    ...(isLoggedIn ? [{ icon: Bookmark, label: 'My List', path: '/mylist', id: 'mylist' }] : []),
    ...(userData?.isAdmin ? [{ icon: UserCog, label: 'Admin Panel', path: '/admin', id: 'admin' }] : []),
  ];

  const handleMobileMenuItemClick = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <h1 
              className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-red-600 cursor-pointer"
              onClick={() => navigate('/')}
            >
              Hem's Flix
            </h1>
            
            {/* Navigation links - Hidden on mobile and small tablets */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-8">
              <button 
                onClick={() => navigate('/')}
                className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 text-sm xl:text-base"
              >
                <Home className="w-4 h-4 xl:w-5 xl:h-5" />
                Home
              </button>
              <button 
                onClick={() => navigate('/movies')}
                className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 text-sm xl:text-base"
              >
                <Film className="w-4 h-4 xl:w-5 xl:h-5" />
                Movies
              </button>
              <button 
                onClick={() => navigate('/series')}
                className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 text-sm xl:text-base"
              >
                <PlaySquare className="w-4 h-4 xl:w-5 xl:h-5" />
                Series
              </button>
              <button 
                onClick={() => navigate('/anime')}
                className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 text-sm xl:text-base"
              >
                <Tv className="w-4 h-4 xl:w-5 xl:h-5" />
                Anime
              </button>
              {isLoggedIn && (
                <button 
                  onClick={() => navigate('/mylist')}
                  className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 text-sm xl:text-base"
                >
                  <Bookmark className="w-4 h-4 xl:w-5 xl:h-5" />
                  My List
                </button>
              )}
              {userData?.isAdmin && (
                <button 
                  onClick={handleAdminClick}
                  className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 text-sm xl:text-base"
                >
                  <UserCog className="w-4 h-4 xl:w-5 xl:h-5" />
                  Admin Panel
                </button>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Search button */}
            <button
              onClick={onSearch}
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </button>

            {/* User menu - Desktop */}
            {isLoggedIn ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="transition-colors"
                >
                  <Avatar className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${userData?.profileImage ? 'border-0' : 'border-2 border-red-600'} hover:border-red-500`}>
                    <AvatarImage 
                      src={userData?.profileImage} 
                      alt={userData?.name || 'Profile'}
                    />
                    <AvatarFallback className="bg-red-600 text-white text-xs sm:text-sm lg:text-base">
                      {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-12 lg:top-14 w-56 lg:w-64 xl:w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                    <div className="p-3 lg:p-4 border-b border-gray-700">
                      <p className="text-white font-semibold text-sm lg:text-base">{userData?.name || currentUser?.name || 'User'}</p>
                      <p className="text-gray-400 text-xs lg:text-sm">{userData?.email || currentUser?.email || 'user@example.com'}</p>
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
                        className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors text-sm lg:text-base"
                      >
                        <User className="w-4 h-4 lg:w-5 lg:h-5" />
                        Profile
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors text-sm lg:text-base"
                      >
                        <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="hidden md:block bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 lg:px-6 py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm lg:text-base"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
            >
              {showMobileMenu ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 sm:w-80 bg-black/95 backdrop-blur-sm border-l border-gray-800 pt-16 sm:pt-20">
            <div className="p-4 sm:p-6">
              {/* Mobile Navigation Menu */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileMenuItemClick(item.path)}
                      className="w-full flex items-center gap-4 px-4 py-3 sm:py-4 text-white hover:bg-gray-800 rounded-lg transition-colors text-base sm:text-lg"
                    >
                      <Icon size={20} className="sm:w-6 sm:h-6" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile User Section */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 px-4 py-3 bg-gray-800 rounded-lg">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarImage 
                          src={userData?.profileImage} 
                          alt={userData?.name || 'Profile'}
                        />
                        <AvatarFallback className="bg-red-600 text-white">
                          {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 truncate">
                        <p className="text-white font-medium truncate text-sm sm:text-base">
                          {userData?.name || currentUser?.name || 'User'}
                        </p>
                        {userData?.isAdmin && (
                          <span className="text-xs text-red-400">Admin</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors text-base sm:text-lg"
                    >
                      <User size={20} className="sm:w-6 sm:h-6" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors text-base sm:text-lg"
                    >
                      <LogOut size={20} className="sm:w-6 sm:h-6" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onLogin();
                      setShowMobileMenu(false);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 sm:py-4 rounded-lg font-semibold transition-colors text-base sm:text-lg"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
