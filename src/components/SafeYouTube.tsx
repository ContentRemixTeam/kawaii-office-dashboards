/**
 * Safe YouTube wrapper with fallback handling
 */
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Play, AlertTriangle, Volume2, VolumeX, Loader2 } from 'lucide-react';
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
  const [videoReady, setVideoReady] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const enhancedA11y = useFeatureFlag('enhancedAccessibility');
  const youtubeAPI = useYouTubeAPI();

  useEffect(() => {
    if (youtubeAPI.isReady && videoId) {
      initializePlayer();
    } else if (youtubeAPI.state === 'error') {
      setHasError(true);
      setErrorMessage(youtubeAPI.error || 'YouTube API failed to load');
      setIsLoading(false);
    }
  }, [videoId, youtubeAPI.state, youtubeAPI.isReady]);

  // Remove the old API loading logic since we use the hook now

  const initializePlayer = () => {
    if (!playerRef.current || !window.YT) {
      setHasError(true);
      setErrorMessage('YouTube player initialization failed');
      setIsLoading(false);
      return;
    }

    try {
      // Reset states
      setHasError(false);
      setIsLoading(true);
      setVideoReady(false);

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
      setHasError(true);
      setErrorMessage('Failed to create YouTube player');
      setIsLoading(false);
      onError?.(error);
    }
  };

  const handlePlayerReady = (event: any) => {
    setIsLoading(false);
    setHasError(false);
    setVideoReady(true);
    
    const playerInstance = event.target;
    
    if (playerInstance && startMuted) {
      try {
        playerInstance.mute();
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
    setHasError(false);
    setErrorMessage('');
    setPlayer(null);
    setVideoReady(false);
    if (youtubeAPI.state === 'error') {
      youtubeAPI.retry();
    } else {
      initializePlayer();
    }
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
      {(isLoading || !youtubeAPI.isReady) && (
        <Card className="absolute inset-0 z-10">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {!youtubeAPI.isReady ? 'Initializing video player...' : 'Loading video...'}
              </p>
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