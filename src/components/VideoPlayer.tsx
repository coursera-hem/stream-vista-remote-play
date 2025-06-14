
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, ArrowLeft } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  poster: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
  videoUrl?: string;
}

interface VideoPlayerProps {
  movie: Movie;
  onBack: () => void;
}

// Convert Google Drive share link to embeddable format
const getEmbedUrl = (driveLink: string): string => {
  if (!driveLink) return '';
  
  let fileId = '';
  
  if (driveLink.includes('/file/d/')) {
    fileId = driveLink.split('/file/d/')[1].split('/')[0];
  } else if (driveLink.includes('id=')) {
    fileId = driveLink.split('id=')[1].split('&')[0];
  }
  
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  return driveLink;
};

// Function to convert Google Drive share link to direct download formats
const getGoogleDriveUrls = (url: string): string[] => {
  console.log('Processing Google Drive URL:', url);
  
  if (!url) return [];
  
  // Check if it's a Google Drive link
  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      // Try multiple formats for Google Drive video streaming
      const urls = [
        `https://drive.google.com/file/d/${fileId}/preview`,
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        `https://drive.google.com/uc?id=${fileId}&export=download`,
        `https://docs.google.com/file/d/${fileId}/preview`
      ];
      console.log('Generated Google Drive URLs:', urls);
      return urls;
    }
  }
  
  // If it's not a Google Drive link, return as is
  return [url];
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [videoLoading, setVideoLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Check if it's a Firebase video or Google Drive video
  const isFirebaseVideo = movie.videoUrl?.includes('firebasestorage.googleapis.com') || false;
  const isGoogleDriveVideo = movie.videoUrl?.includes('drive.google.com') || false;

  // Get all possible URLs for the video
  const videoUrls = movie.videoUrl ? getGoogleDriveUrls(movie.videoUrl) : [];
  const fallbackUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const allUrls = [...videoUrls, fallbackUrl];
  const currentVideoSrc = allUrls[currentUrlIndex] || fallbackUrl;

  console.log('Current video source:', currentVideoSrc);
  console.log('Available URLs:', allUrls);
  console.log('Current URL index:', currentUrlIndex);
  console.log('Is Firebase video:', isFirebaseVideo);
  console.log('Is Google Drive video:', isGoogleDriveVideo);

  // Try next URL when current one fails
  const tryNextUrl = () => {
    if (currentUrlIndex < allUrls.length - 1) {
      console.log('Trying next URL...');
      setCurrentUrlIndex(currentUrlIndex + 1);
      setVideoError(false);
      setVideoLoading(true);
    } else {
      console.log('All URLs failed');
      setVideoError(true);
      setVideoLoading(false);
    }
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
    setVideoError(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
    console.log('Video loaded successfully');
  };

  const handleVideoError = () => {
    console.error('Video loading error for URL:', currentVideoSrc);
    setVideoLoading(false);
    tryNextUrl();
  };

  const handleIframeLoad = () => {
    setVideoLoading(false);
    setVideoError(false);
    console.log('Iframe loaded successfully');
  };

  const handleIframeError = () => {
    console.error('Iframe loading error for URL:', currentVideoSrc);
    setVideoLoading(false);
    tryNextUrl();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isFirebaseVideo) return;

    const updateTime = () => {
      if (video.currentTime && !isNaN(video.currentTime)) {
        setCurrentTime(video.currentTime);
      }
    };
    
    const updateDuration = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
        setVideoError(false);
        console.log('Video loaded successfully with duration:', video.duration);
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadeddata', handleVideoLoad);
    video.addEventListener('error', handleVideoError);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadeddata', handleVideoLoad);
      video.removeEventListener('error', handleVideoError);
    };
  }, [currentVideoSrc, currentUrlIndex, isFirebaseVideo]);

  // Reset when movie changes
  useEffect(() => {
    setCurrentUrlIndex(0);
    setVideoError(false);
    setVideoLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [movie.id]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          onBack();
          break;
        case 'ArrowLeft':
          seek(-10);
          break;
        case 'ArrowRight':
          seek(10);
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || videoError || !isFirebaseVideo) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('Error playing video:', error);
        tryNextUrl();
      });
    }
    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video || !isFirebaseVideo) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
    showControlsTemporarily();
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !duration || isNaN(duration) || !isFirebaseVideo) return;

    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    video.currentTime = newTime;
    showControlsTemporarily();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration || isNaN(duration) || duration <= 0 || !isFirebaseVideo) {
      console.log('Cannot seek: video duration not available or not Firebase video');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    if (!isNaN(newTime) && isFinite(newTime)) {
      video.currentTime = newTime;
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video */}
      <div
        className="relative flex-1 cursor-pointer"
        onClick={showControlsTemporarily}
        onMouseMove={showControlsTemporarily}
      >
        {videoLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-center text-white">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {videoError ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <p className="text-white text-xl mb-4">Video could not be loaded</p>
              {isGoogleDriveVideo ? (
                <div className="text-gray-400 mb-6">
                  <p className="mb-2">This appears to be a Google Drive link.</p>
                  <p className="mb-2">Common issues:</p>
                  <ul className="text-left list-disc list-inside space-y-1 mb-4">
                    <li>File is not publicly accessible</li>
                    <li>File requires permission to view</li>
                    <li>File is not a supported video format</li>
                  </ul>
                  <p className="text-sm">Try making the file public or use a direct video hosting service.</p>
                </div>
              ) : (
                <p className="text-gray-400 mb-6">Please check the video URL and try again.</p>
              )}
              <button
                onClick={onBack}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <>
            {isFirebaseVideo ? (
              <video
                ref={videoRef}
                src={currentVideoSrc}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                crossOrigin="anonymous"
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <iframe
                src={getEmbedUrl(movie.videoUrl || '')}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={movie.title}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            )}
          </>
        )}

        {/* Controls overlay - Only show for Firebase videos */}
        {!videoError && isFirebaseVideo && (
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
                  <p className="text-gray-300">{movie.year} • {movie.genre}</p>
                </div>
              </div>
            </div>

            {/* Center play button */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <Play className="w-10 h-10 text-white ml-1" />
                </button>
              </div>
            )}

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* Progress bar */}
              <div
                className="w-full h-2 bg-white/30 rounded-full mb-4 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-red-600 rounded-full transition-all"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => seek(-10)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => seek(10)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simple overlay for Google Drive videos */}
        {!videoError && !isFirebaseVideo && (
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
                <p className="text-gray-300">{movie.year} • {movie.genre}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
