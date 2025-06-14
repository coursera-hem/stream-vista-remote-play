import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Save, Link as LinkIcon, Upload, X, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadProfileImage, validateImageFile } from '../utils/fileUpload';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const Profile = () => {
  const { currentUser, userData, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [profileImageUrl, setProfileImageUrl] = useState(userData?.profileImage || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    const confirmMessage = `Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including:
    
- Your profile information
- Your watchlist
- All account settings

Type "DELETE" to confirm:`;

    const confirmation = prompt(confirmMessage);
    
    if (confirmation !== 'DELETE') {
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));
      
      // Delete the user account from Firebase Auth
      await deleteUser(currentUser);
      
      // Navigate to home page
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again or contact support.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        validateImageFile(file);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
      } catch (error: any) {
        setError(error.message);
        setSelectedFile(null);
        setPreviewUrl('');
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentImageUrl = () => {
    if (uploadMethod === 'file' && previewUrl) {
      return previewUrl;
    }
    return profileImageUrl || userData?.profileImage;
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let imageUrl = profileImageUrl;

      // If file upload method is selected and a file is chosen, upload it
      if (uploadMethod === 'file' && selectedFile && currentUser) {
        imageUrl = await uploadProfileImage(selectedFile, currentUser.uid);
      }

      await updateUserProfile({ 
        name, 
        email,
        profileImage: imageUrl.trim() || undefined
      });
      
      setSuccess('Profile updated successfully!');
      
      // Clear file selection after successful upload
      if (uploadMethod === 'file') {
        clearFile();
        setProfileImageUrl(imageUrl);
      }
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
        {/* Back Button */}
        <Button
          onClick={handleBack}
          variant="ghost"
          className="mb-4 text-white hover:text-gray-300 hover:bg-gray-800 p-2"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>

        <h1 className="text-4xl font-bold text-white mb-8">Profile</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 space-y-6">
          {/* Profile Image Preview */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={getCurrentImageUrl()} />
              <AvatarFallback className="bg-red-600 text-white text-2xl">
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
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
            {/* Profile Image Upload Method Selection */}
            <div>
              <Label className="text-white mb-3 block">Profile Image</Label>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={uploadMethod === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMethod('url')}
                  className={uploadMethod === 'url' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <LinkIcon size={16} className="mr-1" />
                  URL
                </Button>
                <Button
                  type="button"
                  variant={uploadMethod === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMethod('file')}
                  className={uploadMethod === 'file' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <Upload size={16} className="mr-1" />
                  Upload File
                </Button>
              </div>

              {uploadMethod === 'url' && (
                <div>
                  <Input
                    id="profileImage"
                    type="url"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="https://example.com/your-profile-image.jpg"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Enter a direct link to your profile image (JPEG, PNG, GIF, WebP)
                  </p>
                </div>
              )}

              {uploadMethod === 'file' && (
                <div>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearFile}
                        className="px-2"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Upload an image file (JPEG, PNG, GIF - max 5MB)
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-green-400 mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>

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

          {/* Delete Account Section */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-red-400 mb-3">Danger Zone</h3>
            <p className="text-sm text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              {deleteLoading ? (
                'Deleting Account...'
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete My Account
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
