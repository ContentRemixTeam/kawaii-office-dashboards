/**
 * Safe YouTube wrapper with fallback handling
 */
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Play, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { log } from '@/lib/log';
import { useFeatureFlag } from '@/lib/flags';

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
  const [retryCount, setRetryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(startMuted);
  const playerRef = useRef<HTMLDivElement>(null);
  const enhancedA11y = useFeatureFlag('enhancedAccessibility');

  const maxRetries = 3;

  useEffect(() => {
    if (retryCount >= maxRetries) {
      setHasError(true);
      setErrorMessage('YouTube player failed to load after multiple attempts');
      return;
    }

    loadYouTubeAPI();
  }, [videoId, retryCount]);

  const loadYouTubeAPI = () => {
    try {
      // Reset error state
      setHasError(false);
      setIsLoading(true);

      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      // Load YouTube API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = handleAPILoadError;
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Set up callback
      window.onYouTubeIframeAPIReady = initializePlayer;
      
      // Timeout fallback
      setTimeout(() => {
        if (isLoading && !player) {
          handleAPILoadError(new Error('YouTube API load timeout'));
        }
      }, 10000);
    } catch (error) {
      log.recoverable('SafeYouTube.loadYouTubeAPI', error);
      handleAPILoadError(error);
    }
  };

  const handleAPILoadError = (error: any) => {
    log.warn('YouTube API failed to load:', error);
    setRetryCount(prev => prev + 1);
    setIsLoading(false);
    
    if (retryCount >= maxRetries - 1) {
      setHasError(true);
      setErrorMessage('Unable to load YouTube player. Please check your connection.');
      onError?.(error);
    }
  };

  const initializePlayer = () => {
    if (!playerRef.current || !window.YT) return;

    try {
      const ytPlayer = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          fs: 1,
          playsinline: 1,
          origin: window.location.origin,
          autoplay: 0, // Never autoplay - require user interaction
        },
        events: {
          onReady: handlePlayerReady,
          onError: handlePlayerError,
          onStateChange: handleStateChange,
        },
      });

      setPlayer(ytPlayer);
    } catch (error) {
      log.recoverable('SafeYouTube.initializePlayer', error);
      handleAPILoadError(error);
    }
  };

  const handlePlayerReady = () => {
    setIsLoading(false);
    setHasError(false);
    
    if (player && startMuted) {
      try {
        player.mute();
        setIsMuted(true);
      } catch (error) {
        log.recoverable('SafeYouTube.handlePlayerReady', error);
      }
    }
    
    onReady?.();
  };

  const handlePlayerError = (event: any) => {
    const errorCode = event.data;
    let message = 'Video failed to load';
    
    switch (errorCode) {
      case 2:
        message = 'Invalid video ID';
        break;
      case 5:
        message = 'HTML5 player error';
        break;
      case 100:
        message = 'Video not found or private';
        break;
      case 101:
      case 150:
        message = 'Video playback not allowed';
        break;
    }
    
    log.warn(`YouTube player error ${errorCode}:`, message);
    setHasError(true);
    setErrorMessage(message);
    onError?.(event);
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
    setRetryCount(0);
    setHasError(false);
    setErrorMessage('');
    setPlayer(null);
  };

  if (hasError) {
    return (
      <Card className={`${className} bg-muted/20`}>
        <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Button
              onClick={retry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            
            <p className="text-sm text-muted-foreground">
              You can also try a different video or use the fallback audio options
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <Card className="absolute inset-0 z-10">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading video...</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div 
        ref={playerRef}
        className="w-full h-full"
        aria-label={enhancedA11y ? "YouTube ambient video player" : undefined}
        role={enhancedA11y ? "application" : undefined}
      />
      
      {/* Custom controls overlay for accessibility */}
      {enhancedA11y && player && !isLoading && (
        <div className="absolute bottom-2 left-2 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            <Play className={`w-4 h-4 ${isPlaying ? 'hidden' : 'block'}`} />
            <span className={`w-4 h-4 ${isPlaying ? 'block' : 'hidden'}`}>⏸</span>
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}