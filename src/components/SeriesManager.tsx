
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { Trash2, ArrowLeft, Plus, Settings, Edit } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { SeriesUploadForm } from './SeriesUploadForm';
import { SeriesEditForm } from './SeriesEditForm';

interface FirebaseSeries {
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
  rating: number;
  language: string;
  isTrending: boolean;
  isFeatured: boolean;
  views: number;
}

interface SeriesManagerProps {
  onBack: () => void;
  onManageEpisodes: (seriesId: string, seriesTitle: string) => void;
}

export const SeriesManager: React.FC<SeriesManagerProps> = ({ onBack, onManageEpisodes }) => {
  const [series, setSeries] = useState<FirebaseSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [editingSeries, setEditingSeries] = useState<FirebaseSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      console.log('Fetching series from Firebase...');
      const seriesCollection = collection(db, 'series');
      const seriesSnapshot = await getDocs(seriesCollection);
      const seriesList = seriesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Series data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      }) as FirebaseSeries[];
      
      console.log('Total series fetched:', seriesList.length);
      setSeries(seriesList);
      
      if (seriesList.length === 0) {
        toast({
          title: "Info",
          description: "No series found in the database. Upload some series first.",
        });
      }
    } catch (error) {
      console.error('Error fetching series:', error);
      toast({
        title: "Error",
        description: "Failed to fetch series from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeries = (seriesId: string) => {
    setSelectedSeries(prev => 
      prev.includes(seriesId) 
        ? prev.filter(id => id !== seriesId)
        : [...prev, seriesId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSeries.length === series.length) {
      setSelectedSeries([]);
    } else {
      setSelectedSeries(series.map(s => s.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSeries.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedSeries.length} series? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      console.log('Deleting series:', selectedSeries);
      await Promise.all(
        selectedSeries.map(seriesId => {
          console.log('Deleting series:', seriesId);
          return deleteDoc(doc(db, 'series', seriesId));
        })
      );
      
      toast({
        title: "Success",
        description: `${selectedSeries.length} series deleted successfully`
      });
      
      setSelectedSeries([]);
      await fetchSeries();
    } catch (error) {
      console.error('Error deleting series:', error);
      toast({
        title: "Error",
        description: "Failed to delete series",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSeries = (seriesItem: FirebaseSeries) => {
    setEditingSeries(seriesItem);
  };

  const handleSaveEdit = () => {
    setEditingSeries(null);
    fetchSeries();
  };

  const handleCancelEdit = () => {
    setEditingSeries(null);
  };

  if (editingSeries) {
    return (
      <SeriesEditForm
        series={editingSeries}
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
            Back to Series List
          </Button>
          <h2 className="text-2xl font-bold text-white">Upload New Series</h2>
        </div>
        <SeriesUploadForm />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Loading series...</div>
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
          <h2 className="text-2xl font-bold text-white">Manage Series ({series.length})</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            size="sm"
          >
            <Plus size={16} />
            Upload Series
          </Button>
          {series.length > 0 && (
            <Button
              onClick={handleSelectAll}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              {selectedSeries.length === series.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
          <Button
            onClick={handleDeleteSelected}
            disabled={selectedSeries.length === 0}
            className={`flex items-center gap-2 ${
              selectedSeries.length === 0 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            size="sm"
          >
            <Trash2 size={16} />
            Delete Selected ({selectedSeries.length})
          </Button>
        </div>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl mb-4">No series found in database</p>
          <p className="text-gray-500 mb-6">Upload some series first to manage them here.</p>
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus size={16} className="mr-2" />
            Upload Series
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {series.map((seriesItem) => (
            <div
              key={seriesItem.id}
              className={`bg-gray-800 rounded-lg overflow-hidden transition-all ${
                selectedSeries.includes(seriesItem.id) ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={seriesItem.poster}
                  alt={seriesItem.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', seriesItem.poster);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedSeries.includes(seriesItem.id)}
                    onChange={() => handleSelectSeries(seriesItem.id)}
                    className="w-4 h-4 accent-red-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold truncate">{seriesItem.title}</h3>
                <p className="text-gray-400 text-sm">{seriesItem.genre} • {seriesItem.releaseYear}</p>
                <p className="text-gray-400 text-sm">{seriesItem.episodes} episodes • {seriesItem.status}</p>
                <p className="text-gray-500 text-xs mt-1">ID: {seriesItem.id}</p>
                
                <div className="flex gap-1 mt-3">
                  <Button
                    onClick={() => handleEditSeries(seriesItem)}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white flex-1"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => onManageEpisodes(seriesItem.id, seriesItem.title)}
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
