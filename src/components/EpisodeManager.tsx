
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Plus, Edit, Trash2, Play, Search } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Episode } from '../types/Episode';
import { EpisodeUploadForm } from './EpisodeUploadForm';

interface EpisodeManagerProps {
  animeId?: string;
  animeTitle?: string;
  onBack: () => void;
}

export const EpisodeManager: React.FC<EpisodeManagerProps> = ({
  animeId,
  animeTitle,
  onBack
}) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (animeId) {
      fetchEpisodes();
    }
  }, [animeId]);

  const fetchEpisodes = async () => {
    if (!animeId) return;
    
    try {
      setLoading(true);
      const episodesRef = collection(db, 'episodes');
      const q = query(
        episodesRef,
        where('animeId', '==', animeId),
        orderBy('episodeNumber', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const episodeList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Episode[];
      
      setEpisodes(episodeList);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch episodes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEpisode = async (episodeId: string, episodeNumber: number) => {
    if (window.confirm(`Are you sure you want to delete Episode ${episodeNumber}?`)) {
      try {
        await deleteDoc(doc(db, 'episodes', episodeId));
        toast({
          title: "Success",
          description: "Episode deleted successfully"
        });
        fetchEpisodes();
      } catch (error) {
        console.error('Error deleting episode:', error);
        toast({
          title: "Error",
          description: "Failed to delete episode",
          variant: "destructive"
        });
      }
    }
  };

  const filteredEpisodes = episodes.filter(episode =>
    episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    episode.episodeNumber.toString().includes(searchTerm)
  );

  if (!animeId || !animeTitle) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">No Anime Selected</h2>
        <p className="text-gray-400 mb-6">Please select an anime to manage its episodes.</p>
        <Button onClick={onBack} variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
          <ArrowLeft size={16} className="mr-2" />
          Back to Anime List
        </Button>
      </div>
    );
  }

  if (showUploadForm) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => setShowUploadForm(false)} 
            variant="outline" 
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Episodes
          </Button>
        </div>
        <EpisodeUploadForm
          animeId={animeId}
          animeTitle={animeTitle}
          onEpisodeAdded={() => {
            fetchEpisodes();
            setShowUploadForm(false);
          }}
        />
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
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-white">Manage Episodes</h2>
            <p className="text-gray-400">{animeTitle}</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowUploadForm(true)} 
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus size={16} className="mr-2" />
          Add Episode
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search episodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="text-white text-xl">Loading episodes...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEpisodes.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-white mb-4">No Episodes Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'No episodes match your search.' : 'No episodes have been added yet.'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowUploadForm(true)} 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus size={16} className="mr-2" />
                    Add First Episode
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEpisodes.map((episode) => (
                <div key={episode.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          Episode {episode.episodeNumber}: {episode.title}
                        </h3>
                        {episode.duration && (
                          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            {episode.duration}
                          </span>
                        )}
                      </div>
                      {episode.description && (
                        <p className="text-gray-400 mb-4">{episode.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{episode.views} views</span>
                        {episode.createdAt && (
                          <span>Added: {new Date(episode.createdAt.seconds * 1000).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    {episode.thumbnail && (
                      <img 
                        src={episode.thumbnail} 
                        alt={`Episode ${episode.episodeNumber} thumbnail`}
                        className="w-32 h-20 object-cover rounded ml-4"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      onClick={() => window.open(episode.videoUrl, '_blank')}
                    >
                      <Play size={14} className="mr-1" />
                      Play
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      onClick={() => handleDeleteEpisode(episode.id, episode.episodeNumber)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
