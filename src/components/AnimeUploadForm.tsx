
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { EpisodeManager } from './EpisodeManager';
import { AnimeDetailsForm } from './anime-upload/AnimeDetailsForm';
import { AnimeFormData, AnimeData, DEFAULT_FORM_DATA } from './anime-upload/AnimeUploadTypes';

export const AnimeUploadForm = () => {
  const [formData, setFormData] = useState<AnimeFormData>(DEFAULT_FORM_DATA);
  const [posterUploadMethod, setPosterUploadMethod] = useState<'url' | 'upload'>('url');
  const [loading, setLoading] = useState(false);
  const [posterUploading, setPosterUploading] = useState(false);
  const [posterUploadProgress, setPosterUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'details' | 'episodes'>('details');
  const [createdAnimeId, setCreatedAnimeId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFormDataChange = (updates: Partial<AnimeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.poster) {
      toast({
        title: "Error",
        description: "Please provide a poster image URL or upload a poster image",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Starting anime upload process...');
      console.log('Firebase DB instance:', db);
      
      // Prepare anime data with all required fields
      const animeData: Omit<AnimeData, 'uploadedAt'> & { uploadedAt: any } = {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        releaseYear: formData.releaseYear,
        poster: formData.poster,
        status: formData.status,
        rating: formData.rating,
        language: formData.language,
        isTrending: formData.isTrending,
        isFeatured: formData.isFeatured,
        views: 0,
        episodes: 0, // Default to 0, will be updated when episodes are added
        videoUrl: '', // Default empty, will be set to first episode's video URL when episodes are added
        uploadedAt: serverTimestamp()
      };

      console.log('Prepared anime data:', animeData);
      
      // Get the animes collection reference
      const animesCollection = collection(db, 'animes');
      console.log('Collection reference for "animes":', animesCollection);
      console.log('Collection path:', animesCollection.path);
      
      // Add document to the animes collection
      console.log('Adding document to "animes" collection...');
      const docRef = await addDoc(animesCollection, animeData);
      console.log('Document added successfully!');
      console.log('Generated document ID:', docRef.id);
      console.log('Document reference path:', docRef.path);
      
      setCreatedAnimeId(docRef.id);

      toast({
        title: "Success",
        description: `Anime "${formData.title}" saved successfully with ID: ${docRef.id}. Now you can add episodes.`
      });

      setCurrentStep('episodes');

    } catch (error: any) {
      console.error('Error uploading anime:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast({
        title: "Error",
        description: error.message || 'Failed to upload anime',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setPosterUploadMethod('url');
    setCurrentStep('details');
    setCreatedAnimeId(null);
  };

  // Show episode management step
  if (currentStep === 'episodes' && createdAnimeId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Add Episodes</h2>
              <p className="text-gray-400">Add episodes to {formData.title}</p>
            </div>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Add Another Anime
            </Button>
          </div>
          
          <EpisodeManager
            animeId={createdAnimeId}
            animeTitle={formData.title}
            onBack={resetForm}
          />
        </div>
      </div>
    );
  }

  // Show anime details form
  return (
    <>
      {posterUploading && posterUploadProgress > 0 && (
        <div className="max-w-2xl mx-auto mb-6">
          <div className="p-4 bg-green-500/20 border border-green-500 text-green-400 rounded">
            <div className="flex items-center justify-between mb-2">
              <span>Uploading Poster...</span>
              <span>{posterUploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${posterUploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <AnimeDetailsForm
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleSubmit}
        loading={loading}
        posterUploading={posterUploading}
        posterUploadMethod={posterUploadMethod}
        onPosterUploadMethodChange={setPosterUploadMethod}
      />
    </>
  );
};
