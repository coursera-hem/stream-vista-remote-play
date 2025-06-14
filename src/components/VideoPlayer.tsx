
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

// Function to convert Google Drive share link to direct video link
const convertGoogleDriveUrl = (url: string): string => {
  console.log('Converting Google Drive URL:', url);
  
  if (!url) return '';
  
  // Check if it's a Google Drive link
  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      console.log('Converted to direct URL:', directUrl);
      return directUrl;
    }
  }
  
  // If it's already a direct URL or not a Google Drive link, return as is
  return url;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Convert Google Drive URL to direct video URL, fallback to sample video if none provided
  const videoSrc = movie.videoUrl ? convertGoogleDriveUrl(movie.videoUrl) : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  console.log('Video source:', videoSrc);
  console.log('Original movie videoUrl:', movie.videoUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      if (video.currentTime && !isNaN(video.currentTime)) {
        setCurrentTime(video.currentTime);
      }
    };
    
    const updateDuration = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
        setVideoError(false);
      }
    };

    const handleError = () => {
      console.error('Video loading error');
      setVideoError(true);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('error', handleError);
    };
  }, []);

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
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('Error playing video:', error);
        setVideoError(true);
      });
    }
    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
    showControlsTemporarily();
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !duration || isNaN(duration)) return;

    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    video.currentTime = newTime;
    showControlsTemporarily();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration || isNaN(duration) || duration <= 0) {
      console.log('Cannot seek: video duration not available');
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
        {videoError ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-white text-xl mb-4">Video could not be loaded</p>
              <p className="text-gray-400 mb-4">This might be a Google Drive link that requires different access permissions.</p>
              <button
                onClick={onBack}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            onError={() => setVideoError(true)}
          />
        )}

        {/* Controls overlay */}
        {!videoError && (
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
      </div>
    </div>
  );
};
