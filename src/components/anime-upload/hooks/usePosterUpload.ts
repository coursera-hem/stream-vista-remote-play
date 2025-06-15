
import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';
import { useToast } from '../../../hooks/use-toast';

export const usePosterUpload = () => {
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUploading, setPosterUploading] = useState(false);
  const [posterUploadProgress, setPosterUploadProgress] = useState(0);
  const [posterDragActive, setPosterDragActive] = useState(false);
  const { toast } = useToast();

  const handlePosterUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a valid image file (JPEG, PNG, WebP)",
        variant: "destructive"
      });
      return null;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      });
      return null;
    }

    setPosterUploading(true);
    setPosterUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `anime-posters/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setPosterUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error('Poster upload error:', error);
            toast({
              title: "Upload Error",
              description: "Failed to upload poster image",
              variant: "destructive"
            });
            setPosterUploading(false);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              toast({
                title: "Success",
                description: "Poster image uploaded successfully"
              });
              setPosterUploading(false);
              setPosterUploadProgress(0);
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting poster download URL:', error);
              toast({
                title: "Error",
                description: "Failed to get poster image URL",
                variant: "destructive"
              });
              setPosterUploading(false);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Poster upload error:', error);
      toast({
        title: "Error",
        description: "Failed to start poster upload",
        variant: "destructive"
      });
      setPosterUploading(false);
      return null;
    }
  };

  const handlePosterDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setPosterDragActive(true);
    } else if (e.type === "dragleave") {
      setPosterDragActive(false);
    }
  }, []);

  const handlePosterDrop = useCallback((e: React.DragEvent, onPosterChange: (url: string) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setPosterDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setPosterFile(file);
        handlePosterUpload(file).then(url => {
          if (url) onPosterChange(url);
        });
      }
    }
  }, []);

  const resetPosterUpload = () => {
    setPosterFile(null);
    setPosterUploading(false);
    setPosterUploadProgress(0);
    setPosterDragActive(false);
  };

  return {
    posterFile,
    setPosterFile,
    posterUploading,
    posterUploadProgress,
    posterDragActive,
    handlePosterUpload,
    handlePosterDrag,
    handlePosterDrop,
    resetPosterUpload
  };
};
