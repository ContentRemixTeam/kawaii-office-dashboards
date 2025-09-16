/**
 * Safe YouTube wrapper with automatic retry and enhanced error handling
 */
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Play, Pause, AlertTriangle, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { log } from '@/lib/log';
import { useFeatureFlag } from '@/lib/flags';
import { useYouTubeAPI } from '@/hooks/useYouTubeAPI';

interface SafeYouTubeProps {
  videoId: string;
  startMuted?: boolean;
  className?: string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getVolume: () => number;
  destroy: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function SafeYouTube({
  videoId,
  startMuted = true,
  className = '',
  onReady,
  onError
}: SafeYouTubeProps) {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(startMuted);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [enhancedA11y, setEnhancedA11y] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const youtubeAPI = useYouTubeAPI();
  const playerRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize player when API is ready and videoId is provided
  useEffect(() => {
    if (!youtubeAPI.isReady || !videoId || hasError) {
      return;
    }

    console.log('SafeYouTube: Starting player initialization for video:', videoId);
    setIsLoading(true);
    setIsInitializing(true);
    setIsVisible(false);
    
    // Add 500ms delay before initialization for better stability
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }
    
    initTimeoutRef.current = setTimeout(() => {
      initializePlayer();
    }, 500);

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [youtubeAPI.isReady, videoId, retryAttempts]);

  const initializePlayer = async () => {
    if (!playerRef.current || !window.YT?.Player) {
      console.error('SafeYouTube: Player ref or YT.Player not available');
      return;
    }

    try {
      console.log('SafeYouTube: Creating YouTube player instance');
      
      // Clean up existing player
      if (player) {
        try {
          player.destroy();
          console.log('SafeYouTube: Destroyed existing player');
        } catch (e) {
          console.warn('SafeYouTube: Error destroying existing player:', e);
        }
      }

      // Clear the container
      playerRef.current.innerHTML = '';

      // Create unique player ID
      const playerId = `yt-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const playerDiv = document.createElement('div');
      playerDiv.id = playerId;
      playerRef.current.appendChild(playerDiv);

      // Create player instance with enhanced error handling
      const newPlayer = new window.YT.Player(playerId, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          fs: 1, // Allow fullscreen
          hl: 'en', // Language
          cc_lang_pref: 'en' // Captions language
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
          onError: handlePlayerError,
        },
      });

      setPlayer(newPlayer);
      console.log('SafeYouTube: Player instance created successfully');
    } catch (error) {
      console.error('SafeYouTube: Error initializing player:', error);
      handlePlayerError({ data: -1 });
    }
  };

  const handlePlayerReady = (event: any) => {
    console.log('SafeYouTube: Player ready for video:', videoId);
    setIsLoading(false);
    setIsInitializing(false);
    setHasError(false);
    setErrorMessage('');
    setRetryAttempts(0);
    
    // Add delay before making video visible for smoother user experience
    setTimeout(() => {
      setIsVisible(true);
      console.log('SafeYouTube: Video made visible');
    }, 200);
    
    if (startMuted) {
      try {
        event.target.mute();
        setIsMuted(true);
        console.log('SafeYouTube: Player muted on ready');
      } catch (error) {
        console.warn('SafeYouTube: Error muting player:', error);
      }
    }
    
    if (onReady) {
      onReady();
    }
  };

  const handlePlayerError = (event: any) => {
    const errorCode = event.data;
    let message = 'An error occurred while loading the video.';
    let shouldRetry = false;
    
    switch (errorCode) {
      case 2:
        message = 'Invalid video ID or corrupted video data.';
        shouldRetry = false;
        break;
      case 5:
        message = 'HTML5 player error occurred.';
        shouldRetry = true;
        break;
      case 100:
        message = 'Video not found or has been removed.';
        shouldRetry = false;
        break;
      case 101:
      case 150:
        message = 'Video cannot be embedded or is restricted.';
        shouldRetry = false;
        break;
      case -1:
        message = 'Network or loading error occurred.';
        shouldRetry = true;
        break;
      default:
        message = `Video error (code: ${errorCode}). Please try again.`;
        shouldRetry = true;
    }
    
    console.error(`SafeYouTube: Player error for video ${videoId}:`, errorCode, message);
    
    // Automatic retry logic for retryable errors
    if (shouldRetry && retryAttempts < 3) {
      console.log(`SafeYouTube: Auto-retrying (attempt ${retryAttempts + 1}/3) after error:`, message);
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      retryTimeoutRef.current = setTimeout(() => {
        setRetryAttempts(prev => prev + 1);
        setHasError(false);
        setErrorMessage('');
      }, 1000 * (retryAttempts + 1)); // Progressive delay: 1s, 2s, 3s
      
      return;
    }
    
    // No more retries or non-retryable error
    setErrorMessage(message);
    setHasError(true);
    setIsLoading(false);
    setIsInitializing(false);
    setIsVisible(false);
    
    if (onError) {
      onError(event);
    }
  };

  const handleStateChange = (event: any) => {
    if (!window.YT) return;
    
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
  };

  const togglePlayPause = () => {
    if (!player) return;
    
    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        // Unmute on first play for better UX
        if (isMuted && !startMuted) {
          player.unMute();
          setIsMuted(false);
        }
        player.playVideo();
      }
    } catch (error) {
      log.recoverable('SafeYouTube.togglePlayPause', error);
    }
  };

  const toggleMute = () => {
    if (!player) return;
    
    try {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    } catch (error) {
      log.recoverable('SafeYouTube.toggleMute', error);
    }
  };

  const retry = () => {
    console.log('SafeYouTube: Manual retry triggered');
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    setIsVisible(false);
    setRetryAttempts(prev => prev + 1);
    youtubeAPI.retry();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      if (player) {
        try {
          player.destroy();
          console.log('SafeYouTube: Player destroyed during cleanup');
        } catch (e) {
          console.warn('SafeYouTube: Error during cleanup:', e);
        }
      }
    };
  }, [player]);

  // Error state with automatic retry info
  if (hasError) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-4">
            ⚠️ Video Error
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {errorMessage}
          </p>
          {retryAttempts < 3 ? (
            <p className="text-xs text-muted-foreground mb-4">
              Automatic retry in progress... (Attempt {retryAttempts + 1}/3)
            </p>
          ) : (
            <Button 
              onClick={retry}
              variant="outline"
              size="sm"
              disabled={youtubeAPI.state === 'loading'}
            >
              {youtubeAPI.state === 'loading' ? 'Loading...' : 'Try Again'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Loading state with better feedback
  if (isLoading || !youtubeAPI.isReady || isInitializing) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></span>
          </div>
          <p className="text-sm text-muted-foreground">
            {!youtubeAPI.isReady 
              ? 'Loading video player...' 
              : isInitializing 
                ? 'Initializing video...' 
                : 'Preparing video...'}
          </p>
          {retryAttempts > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Retry attempt {retryAttempts}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* YouTube Player */}
      <div 
        ref={playerRef}
        className={`w-full h-full min-h-[200px] bg-black rounded-lg overflow-hidden transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ aspectRatio: '16/9' }}
      />

      {/* Loading overlay during initialization */}
      {!isVisible && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Custom Controls (when enhanced accessibility is enabled) */}
      {enhancedA11y && player && isVisible && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-black/75 p-2 rounded">
          <Button
            size="sm"
            variant="ghost"
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMute}
            className="text-white hover:bg-white/20"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}