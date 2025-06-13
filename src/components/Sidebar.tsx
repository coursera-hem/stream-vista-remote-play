
import React, { useState } from 'react';
import { Home, Film, Bookmark, UserCog, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

interface SidebarProps {
  onLogout: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, isLoggedIn, onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/', id: 'home' },
    { icon: Film, label: 'Movies', path: '/movies', id: 'movies' },
    ...(isLoggedIn ? [{ icon: Bookmark, label: 'My List', path: '/mylist', id: 'mylist' }] : []),
    ...(userData?.isAdmin ? [{ icon: UserCog, label: 'Admin Panel', path: '/admin', id: 'admin' }] : []),
  ];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const selectedItem = menuItems[focusedIndex];
        if (selectedItem) {
          navigate(selectedItem.path);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, menuItems]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-black/90 transition-colors"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-black/95 backdrop-blur-sm border-r border-gray-800 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-red-600">StreamFlix</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isFocused = focusedIndex === index && isOpen;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                      ${isActive ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                      ${isFocused ? 'ring-2 ring-red-500 bg-gray-800' : ''}
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          {isLoggedIn ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-white text-sm font-medium truncate">
                    {userData?.name || 'User'}
                  </p>
                  {userData?.isAdmin && (
                    <span className="text-xs text-red-400">Admin</span>
                  )}
                </div>
              </div>
              <Button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                onLogin();
                setIsOpen(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
