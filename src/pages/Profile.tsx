
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Camera, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser, userData, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile({ name, email });
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation
        onSearch={() => {}}
        onLogin={handleLogin}
        isLoggedIn={!!currentUser}
        onLogout={handleLogout}
        currentUser={userData ? { name: userData.name, email: userData.email } : undefined}
      />

      <div className="pt-20 px-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Profile</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userData?.profileImage} />
                <AvatarFallback className="bg-red-600 text-white text-2xl">
                  {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 p-2 rounded-full">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{userData?.name}</h3>
              <p className="text-gray-400">{userData?.email}</p>
              {userData?.isAdmin && (
                <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded mt-1">
                  Admin
                </span>
              )}
            </div>
          </div>

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter your email"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
