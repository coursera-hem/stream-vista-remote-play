import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { Trash2, ArrowLeft, Plus, Settings, Edit } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { AnimeUploadForm } from './AnimeUploadForm';
import { AnimeEditForm } from './AnimeEditForm';

interface FirebaseAnime {
  id: string;
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  episodes: number;
  status: string;
  poster: string;
  videoUrl: string;
  uploadedAt: Date;
}

interface AnimeManagerProps {
  onBack: () => void;
  onManageEpisodes: (animeId: string, animeTitle: string) => void;
}

export const AnimeManager: React.FC<AnimeManagerProps> = ({ onBack, onManageEpisodes }) => {
  const [animes, setAnimes] = useState<FirebaseAnime[]>([]);
  const [selectedAnimes, setSelectedAnimes] = useState<string[]>([]);
  const [editingAnime, setEditingAnime] = useState<FirebaseAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    try {
      console.log('Fetching animes from Firebase...');
      const animesCollection = collection(db, 'animes');
      const animeSnapshot = await getDocs(animesCollection);
      const animeList = animeSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Anime data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      }) as FirebaseAnime[];
      
      console.log('Total animes fetched:', animeList.length);
      setAnimes(animeList);
      
      if (animeList.length === 0) {
        toast({
          title: "Info",
          description: "No animes found in the database. Upload some animes first.",
        });
      }
    } catch (error) {
      console.error('Error fetching animes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch animes from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnime = (animeId: string) => {
    setSelectedAnimes(prev => 
      prev.includes(animeId) 
        ? prev.filter(id => id !== animeId)
        : [...prev, animeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnimes.length === animes.length) {
      setSelectedAnimes([]);
    } else {
      setSelectedAnimes(animes.map(anime => anime.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedAnimes.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedAnimes.length} anime(s)? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      console.log('Deleting animes:', selectedAnimes);
      await Promise.all(
        selectedAnimes.map(animeId => {
          console.log('Deleting anime:', animeId);
          return deleteDoc(doc(db, 'animes', animeId));
        })
      );
      
      toast({
        title: "Success",
        description: `${selectedAnimes.length} anime(s) deleted successfully`
      });
      
      setSelectedAnimes([]);
      await fetchAnimes();
    } catch (error) {
      console.error('Error deleting animes:', error);
      toast({
        title: "Error",
        description: "Failed to delete animes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAnime = (anime: FirebaseAnime) => {
    setEditingAnime(anime);
  };

  const handleSaveEdit = () => {
    setEditingAnime(null);
    fetchAnimes();
  };

  const handleCancelEdit = () => {
    setEditingAnime(null);
  };

  if (editingAnime) {
    return (
      <AnimeEditForm
        anime={editingAnime}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }

  if (showUploadForm) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setShowUploadForm(false)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Anime List
          </Button>
          <h2 className="text-2xl font-bold text-white">Upload New Anime</h2>
        </div>
        <AnimeUploadForm />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Loading animes...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-white">Manage Animes ({animes.length})</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            size="sm"
          >
            <Plus size={16} />
            Upload Anime
          </Button>
          {animes.length > 0 && (
            <Button
              onClick={handleSelectAll}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              {selectedAnimes.length === animes.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
          <Button
            onClick={handleDeleteSelected}
            disabled={selectedAnimes.length === 0}
            className={`flex items-center gap-2 ${
              selectedAnimes.length === 0 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            size="sm"
          >
            <Trash2 size={16} />
            Delete Selected ({selectedAnimes.length})
          </Button>
        </div>
      </div>

      {animes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl mb-4">No animes found in database</p>
          <p className="text-gray-500 mb-6">Upload some animes first to manage them here.</p>
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus size={16} className="mr-2" />
            Upload Anime
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {animes.map((anime) => (
            <div
              key={anime.id}
              className={`bg-gray-800 rounded-lg overflow-hidden transition-all ${
                selectedAnimes.includes(anime.id) ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={anime.poster}
                  alt={anime.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', anime.poster);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedAnimes.includes(anime.id)}
                    onChange={() => handleSelectAnime(anime.id)}
                    className="w-4 h-4 accent-red-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold truncate">{anime.title}</h3>
                <p className="text-gray-400 text-sm">{anime.genre} • {anime.releaseYear}</p>
                <p className="text-gray-400 text-sm">{anime.episodes} episodes • {anime.status}</p>
                <p className="text-gray-500 text-xs mt-1">ID: {anime.id}</p>
                
                <div className="flex gap-1 mt-3">
                  <Button
                    onClick={() => handleEditAnime(anime)}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white flex-1"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => onManageEpisodes(anime.id, anime.title)}
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white flex-1"
                  >
                    <Settings size={14} className="mr-1" />
                    Episodes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
