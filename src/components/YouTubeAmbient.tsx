import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Wifi, WifiOff, AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/lib/log';
import { useYouTubeAPI } from '@/hooks/useYouTubeAPI';

// YouTube Player types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Enhanced error types and states
type LoadingState = 'idle' | 'loading' | 'ready' | 'error' | 'retrying';
type NetworkState = 'online' | 'offline' | 'unknown';

interface YouTubeError {
  code: number;
  message: string;
  retryable: boolean;
}

interface YouTubeAmbientProps {
  videoId: string;
  onError?: (error: YouTubeError) => void;
  startMuted?: boolean;
  className?: string;
  maxRetries?: number;
  retryDelay?: number;
}

const STORAGE_KEYS = {
  volume: 'fm_yt_volume',
  muted: 'fm_yt_muted',
  gestureCompleted: 'fm_yt_gesture'
};

// Enhanced error mapping with retry logic
const YOUTUBE_ERRORS: Record<number, YouTubeError> = {
  2: { code: 2, message: 'Invalid video ID', retryable: false },
  5: { code: 5, message: 'Video playback error', retryable: true },
  100: { code: 100, message: 'Video not found', retryable: false },
  101: { code: 101, message: 'Video unavailable', retryable: false },
  150: { code: 150, message: 'Video embedding disabled', retryable: false },
  [-1]: { code: -1, message: 'Network or API error', retryable: true }
};

let apiLoadPromise: Promise<void> | null = null;
let apiLoadAttempts = 0;
const MAX_API_LOAD_ATTEMPTS = 3;

// Enhanced YouTube API loading with retry logic
const loadYouTubeAPI = (): Promise<void> => {
  if (apiLoadPromise) return apiLoadPromise;
  
  apiLoadPromise = new Promise((resolve, reject) => {
    const attemptLoad = () => {
      try {
        if (window.YT && window.YT.Player) {
          log.debug("YouTube API already loaded");
          resolve();
          return;
        }
        
        // Check network connectivity
        if (!navigator.onLine) {
          throw new Error("No internet connection");
        }
        
        // Set global callback with timeout
        const timeoutId = setTimeout(() => {
          apiLoadAttempts++;
          if (apiLoadAttempts >= MAX_API_LOAD_ATTEMPTS) {
            reject(new Error(`YouTube API failed to load after ${MAX_API_LOAD_ATTEMPTS} attempts`));
          } else {
            log.warn(`YouTube API load attempt ${apiLoadAttempts} timed out, retrying...`);
            attemptLoad();
          }
        }, 10000); // 10 second timeout
        
        window.onYouTubeIframeAPIReady = () => {
          clearTimeout(timeoutId);
          log.info("YouTube API loaded successfully");
          resolve();
        };
        
        // Load script if not already present
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const script = document.createElement('script');
          script.src = 'https://www.youtube.com/iframe_api';
          script.async = true;
          script.onerror = () => {
            clearTimeout(timeoutId);
            apiLoadAttempts++;
            if (apiLoadAttempts >= MAX_API_LOAD_ATTEMPTS) {
              reject(new Error("Failed to load YouTube API script"));
            } else {
              log.warn(`YouTube API script load failed, attempt ${apiLoadAttempts}, retrying...`);
              setTimeout(attemptLoad, 2000); // Retry after 2 seconds
            }
          };
          document.head.appendChild(script);
          log.debug("YouTube API script loaded");
        }
      } catch (error) {
        log.error("Error in YouTube API load attempt:", error);
        reject(error);
      }
    };
    
    attemptLoad();
  });
  
  return apiLoadPromise;
};

// Utility to validate YouTube video ID
const isValidVideoId = (videoId: string): boolean => {
  if (!videoId || typeof videoId !== 'string') return false;
  const regex = /^[a-zA-Z0-9_-]{11}$/;
  return regex.test(videoId);
};

// Network status detection
const useNetworkStatus = (): NetworkState => {
  const [networkState, setNetworkState] = useState<NetworkState>(() => {
    if (typeof navigator === 'undefined') return 'unknown';
    return navigator.onLine ? 'online' : 'offline';
  });

  useEffect(() => {
    const handleOnline = () => {
      setNetworkState('online');
      log.debug("Network status: online");
    };
    
    const handleOffline = () => {
      setNetworkState('offline');
      log.debug("Network status: offline");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return networkState;
};

export default function YouTubeAmbient({ 
  videoId, 
  onError, 
  startMuted = true, 
  className = '',
  maxRetries = 3,
  retryDelay = 2000
}: YouTubeAmbientProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use centralized YouTube API hook
  const youtubeAPI = useYouTubeAPI();
  
  // Enhanced state management
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentError, setCurrentError] = useState<YouTubeError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const networkState = useNetworkStatus();
  
  const [volume, setVolume] = useState(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.volume) || '50', 10);
    } catch {
      return 50;
    }
  });
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.muted);
      return saved ? JSON.parse(saved) : startMuted;
    } catch {
      return startMuted;
    }
  });
  const [needsGesture, setNeedsGesture] = useState(() => {
    try {
      return !localStorage.getItem(STORAGE_KEYS.gestureCompleted);
    } catch {
      return true;
    }
  });
  
  const { toast } = useToast();

  // Enhanced error handling
  const handlePlayerError = useCallback((errorCode: number) => {
    const error = YOUTUBE_ERRORS[errorCode] || { 
      code: errorCode, 
      message: `Unknown error (${errorCode})`, 
      retryable: true 
    };
    
    log.error(`YouTube player error: ${error.message} (${error.code})`);
    setCurrentError(error);
    setLoadingState('error');
    
    if (onError) {
      onError(error);
    }

    // Show user-friendly toast
    toast({
      title: "Video Error",
      description: error.message,
      variant: "destructive",
    });
  }, [onError, toast]);

  // Retry logic for failed loads
  const retryInitialization = useCallback(() => {
    if (retryCount >= maxRetries) {
      log.error(`Max retries (${maxRetries}) reached for video ${videoId}`);
      toast({
        title: "Failed to Load Video",
        description: "Please check your connection and try again later.",
        variant: "destructive",
      });
      return;
    }

    setRetryCount(prev => prev + 1);
    setLoadingState('retrying');
    setCurrentError(null);
    
    log.info(`Retrying video load, attempt ${retryCount + 1}/${maxRetries}`);
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    retryTimeoutRef.current = setTimeout(() => {
      setLoadingState('loading');
    }, retryDelay);
  }, [retryCount, maxRetries, videoId, retryDelay, toast]);

  // Save state to localStorage with error handling
  const saveVolumeState = useCallback((vol: number, muted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEYS.volume, vol.toString());
      localStorage.setItem(STORAGE_KEYS.muted, JSON.stringify(muted));
    } catch (e) {
      log.warn('Failed to save volume state:', e);
    }
  }, []);

  const completeGesture = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.gestureCompleted, 'true');
      setNeedsGesture(false);
    } catch (e) {
      log.warn('Failed to save gesture state:', e);
    }
  }, []);

  // Enhanced player initialization with centralized API management
  useEffect(() => {
    if (!videoId) {
      setLoadingState('error');
      setCurrentError({ code: -1, message: 'No video ID provided', retryable: false });
      return;
    }

    if (!isValidVideoId(videoId)) {
      const error = { code: 2, message: 'Invalid video ID format', retryable: false };
      setCurrentError(error);
      setLoadingState('error');
      handlePlayerError(2);
      return;
    }

    if (networkState === 'offline') {
      const error = { code: -1, message: 'No internet connection', retryable: true };
      setCurrentError(error);
      setLoadingState('error');
      return;
    }

    console.log('YouTubeAmbient: Effect triggered', { 
      videoId, 
      youtubeAPIState: youtubeAPI.state, 
      isReady: youtubeAPI.isReady,
      isConnected: youtubeAPI.isConnected 
    });

    if (!youtubeAPI.isReady) {
      console.log('YouTubeAmbient: YouTube API not ready, attempting to load...');
      setLoadingState('loading');
      
      // Try to load the API with a timeout
      const loadTimeout = setTimeout(() => {
        console.error('YouTubeAmbient: API load timeout after 10 seconds');
        setLoadingState('error');
        setCurrentError({ code: -1, message: 'YouTube API load timeout', retryable: true });
      }, 10000);

      youtubeAPI.loadAPI()
        .then(() => {
          clearTimeout(loadTimeout);
          console.log('YouTubeAmbient: API loaded successfully, proceeding with player init');
        })
        .catch(error => {
          clearTimeout(loadTimeout);
          console.error('YouTubeAmbient: Failed to load YouTube API:', error);
          setLoadingState('error');
          setCurrentError({ code: -1, message: 'Failed to load YouTube API', retryable: true });
        });
      return;
    }

    const initPlayer = async () => {
      try {
        setLoadingState('loading');
        setCurrentError(null);
        setIsVisible(false);
        
        console.log(`YouTubeAmbient: Initializing player for video: ${videoId}`);
        
        if (!containerRef.current) {
          throw new Error('Container ref not available');
        }

        // Clean up any existing player
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try {
            playerRef.current.destroy();
            console.log('YouTubeAmbient: Destroyed existing player');
          } catch (e) {
            log.warn('Error destroying existing player:', e);
          }
        }

        // Add 500ms delay for better initialization stability
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }

        initTimeoutRef.current = setTimeout(() => {
          try {
            // Create player container
            const playerId = `youtube-ambient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const playerDiv = document.createElement('div');
            playerDiv.id = playerId;
            containerRef.current!.innerHTML = '';
            containerRef.current!.appendChild(playerDiv);

            playerRef.current = new window.YT.Player(playerId, {
              videoId,
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 0,
                mute: startMuted ? 1 : 0,
                controls: 0,
                showinfo: 0,
                rel: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                disablekb: 1,
                fs: 0,
                cc_load_policy: 0,
                playsinline: 1,
                enablejsapi: 1,
                origin: window.location.origin
              },
              events: {
                onReady: (event: any) => {
                  try {
                    console.log(`YouTubeAmbient: Player ready for video: ${videoId}`);
                    setLoadingState('ready');
                    setRetryCount(0); // Reset retry count on successful load
                    
                    // Delay visibility for smoother experience
                    setTimeout(() => {
                      setIsVisible(true);
                      console.log('YouTubeAmbient: Video made visible');
                    }, 200);
                    
                    // Set initial volume and mute state
                    event.target.setVolume(volume);
                    if (isMuted || startMuted) {
                      event.target.mute();
                    } else {
                      event.target.unMute();
                    }
                  } catch (error) {
                    console.error('YouTubeAmbient: Error in onReady callback:', error);
                    handlePlayerError(-1);
                  }
                },
                onStateChange: (event: any) => {
                  try {
                    const isCurrentlyPlaying = event.data === window.YT.PlayerState.PLAYING;
                    setIsPlaying(isCurrentlyPlaying);
                    
                    // Log state changes for debugging
                    const states = {
                      [-1]: 'unstarted',
                      [0]: 'ended',
                      [1]: 'playing',
                      [2]: 'paused',
                      [3]: 'buffering',
                      [5]: 'cued'
                    };
                    console.log(`YouTubeAmbient: Player state changed to: ${states[event.data] || event.data}`);
                  } catch (error) {
                    console.error('YouTubeAmbient: Error in onStateChange callback:', error);
                  }
                },
                onError: (event: any) => {
                  console.error('YouTubeAmbient: Player error event:', event.data);
                  handlePlayerError(event.data);
                }
              }
            });
            
            console.log('YouTubeAmbient: Player instance created');
          } catch (error) {
            console.error('YouTubeAmbient: Error in delayed initialization:', error);
            if (currentError?.retryable !== false && retryCount < maxRetries) {
              retryInitialization();
            } else {
              setLoadingState('error');
              setCurrentError({ code: -1, message: 'Failed to initialize player', retryable: false });
            }
          }
        }, 500);

      } catch (error) {
        console.error('YouTubeAmbient: Failed to initialize YouTube player:', error);
        
        if (currentError?.retryable !== false && retryCount < maxRetries) {
          retryInitialization();
        } else {
          setLoadingState('error');
          setCurrentError({ code: -1, message: 'Failed to initialize player', retryable: false });
        }
      }
    };

    initPlayer();

    return () => {
      // Cleanup
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
          console.log('YouTubeAmbient: Player destroyed during cleanup');
        } catch (e) {
          log.warn('Error destroying YouTube player:', e);
        }
      }
    };
  }, [videoId, startMuted, volume, isMuted, networkState, retryCount, maxRetries, handlePlayerError, retryInitialization, currentError, youtubeAPI.isReady]);

  // Enhanced control handlers with better error handling
  const handlePlay = useCallback(() => {
    if (!playerRef.current || loadingState !== 'ready') return;
    
    try {
      if (needsGesture) {
        completeGesture();
        playerRef.current.unMute();
        setIsMuted(false);
        saveVolumeState(volume, false);
      }
      
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (error) {
      log.error('Play/pause error:', error);
      toast({
        title: "Playback Error",
        description: "Unable to control video playback",
        variant: "destructive",
      });
    }
  }, [loadingState, isPlaying, needsGesture, completeGesture, volume, saveVolumeState, toast]);

  const handleMute = useCallback(() => {
    if (!playerRef.current || loadingState !== 'ready') return;
    
    try {
      const newMuted = !isMuted;
      if (newMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        if (needsGesture) {
          completeGesture();
        }
      }
      setIsMuted(newMuted);
      saveVolumeState(volume, newMuted);
    } catch (error) {
      log.error('Mute toggle error:', error);
    }
  }, [loadingState, isMuted, volume, needsGesture, completeGesture, saveVolumeState]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!playerRef.current || loadingState !== 'ready') return;
    
    const newVolume = value[0];
    try {
      playerRef.current.setVolume(newVolume);
      setVolume(newVolume);
      
      // Unmute if volume > 0
      if (newVolume > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
        if (needsGesture) {
          completeGesture();
        }
      }
      
      saveVolumeState(newVolume, newVolume === 0 ? true : isMuted && newVolume === 0);
    } catch (error) {
      log.error('Volume change error:', error);
    }
  }, [loadingState, isMuted, needsGesture, completeGesture, saveVolumeState]);

  const handleEnableAudio = useCallback(() => {
    if (!playerRef.current || loadingState !== 'ready') return;
    
    try {
      completeGesture();
      playerRef.current.unMute();
      playerRef.current.playVideo();
      setIsMuted(false);
      setIsPlaying(true);
      saveVolumeState(volume, false);
    } catch (error) {
      log.error('Enable audio error:', error);
      toast({
        title: "Audio Error",
        description: "Unable to enable audio playback",
        variant: "destructive",
      });
    }
  }, [loadingState, completeGesture, volume, saveVolumeState, toast]);

  // Manual retry handler
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setCurrentError(null);
    setLoadingState('loading');
  }, []);

  // Determine current status for UI
  const isReady = loadingState === 'ready';
  const isLoading = loadingState === 'loading' || loadingState === 'retrying';
  const hasError = loadingState === 'error';
  const isOffline = networkState === 'offline';

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-lg bg-black/10 ${className}`}>
      {/* YouTube Player Container */}
      <div 
        ref={containerRef}
        className="w-full h-full aspect-video"
        style={{ minHeight: '200px' }}
      />
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
            <p className="text-sm">
              {loadingState === 'retrying' ? `Retrying... (${retryCount}/${maxRetries})` : 'Loading video...'}
            </p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {hasError && currentError && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center text-white max-w-sm mx-auto p-4">
            <div className="flex items-center justify-center mb-3">
              {isOffline ? (
                <WifiOff className="w-8 h-8 text-red-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isOffline ? 'No Connection' : 'Video Error'}
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              {isOffline ? 'Check your internet connection' : currentError.message}
            </p>
            {(currentError.retryable || isOffline) && retryCount < maxRetries && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Network Status Indicator */}
      {isOffline && (
        <div className="absolute top-3 left-3 bg-red-500/90 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 z-10">
          <WifiOff className="w-3 h-3" />
          Offline
        </div>
      )}
      
      {/* Enable Audio Overlay */}
      {needsGesture && isReady && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
          <Button
            onClick={handleEnableAudio}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl"
          >
            <Play className="w-6 h-6 mr-2" />
            Enable Audio
          </Button>
        </div>
      )}
      
      {/* Controls Bar */}
      {isReady && !needsGesture && (
        <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border/20">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <Button
              onClick={handlePlay}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            {/* Mute */}
            <Button
              onClick={handleMute}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            
            {/* Volume Slider */}
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={5}
                className="w-full"
                disabled={isLoading}
              />
            </div>
            
            {/* Network Status */}
            {networkState === 'online' && (
              <Wifi className="w-3 h-3 text-green-500" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}