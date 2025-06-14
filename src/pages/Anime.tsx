
import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Sidebar } from '../components/Sidebar';
import { SearchModal } from '../components/SearchModal';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Anime = () => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { currentUser, logout, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation
        onSearch={() => setShowSearchModal(true)}
        onLogin={() => setShowLoginModal(true)}
        isLoggedIn={!!currentUser}
        onLogout={handleLogout}
        currentUser={userData ? { name: userData.name, email: userData.email } : undefined}
      />
      
      <Sidebar
        onLogout={handleLogout}
        isLoggedIn={!!currentUser}
        onLogin={() => setShowLoginModal(true)}
      />

      <main className="pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Anime Collection</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder content for anime */}
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Anime Content</span>
              </div>
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-gray-400 text-sm mt-2">
                Anime content will be available here
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Anime Content</span>
              </div>
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-gray-400 text-sm mt-2">
                Anime content will be available here
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Anime Content</span>
              </div>
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-gray-400 text-sm mt-2">
                Anime content will be available here
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Anime Content</span>
              </div>
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-gray-400 text-sm mt-2">
                Anime content will be available here
              </p>
            </div>
          </div>
        </div>
      </main>

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onMovieSelect={() => {}}
        movies={[]}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => navigate('/signin')}
        onRegister={() => navigate('/signup')}
      />
    </div>
  );
};

export default Anime;
