import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

// YouTube Player types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeAmbientProps {
  videoId: string;
  onError?: (code: number) => void;
  startMuted?: boolean;
  className?: string;
}

const STORAGE_KEYS = {
  volume: 'fm_yt_volume',
  muted: 'fm_yt_muted',
  gestureCompleted: 'fm_yt_gesture'
};

let apiLoadPromise: Promise<void> | null = null;

// Load YouTube IFrame API once
const loadYouTubeAPI = (): Promise<void> => {
  if (apiLoadPromise) return apiLoadPromise;
  
  apiLoadPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    
    // Set global callback
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
    
    // Load script if not already present
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }
  });
  
  return apiLoadPromise;
};

export default function YouTubeAmbient({ 
  videoId, 
  onError, 
  startMuted = true, 
  className = '' 
}: YouTubeAmbientProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Save state to localStorage
  const saveVolumeState = useCallback((vol: number, muted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEYS.volume, vol.toString());
      localStorage.setItem(STORAGE_KEYS.muted, JSON.stringify(muted));
    } catch (e) {
      console.warn('Failed to save volume state:', e);
    }
  }, []);

  const completeGesture = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.gestureCompleted, 'true');
      setNeedsGesture(false);
    } catch (e) {
      console.warn('Failed to save gesture state:', e);
    }
  }, []);

  // Initialize YouTube player
  useEffect(() => {
    if (!videoId) return;

    const initPlayer = async () => {
      try {
        await loadYouTubeAPI();
        
        if (!containerRef.current) return;

        // Create player container
        const playerId = `youtube-player-${Math.random().toString(36).substr(2, 9)}`;
        const playerDiv = document.createElement('div');
        playerDiv.id = playerId;
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(playerDiv);

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
              setIsReady(true);
              // Set initial volume and mute state
              event.target.setVolume(volume);
              if (isMuted || startMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
              }
            },
            onStateChange: (event: any) => {
              const isCurrentlyPlaying = event.data === window.YT.PlayerState.PLAYING;
              setIsPlaying(isCurrentlyPlaying);
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
              if (onError) {
                onError(event.data);
              }
            }
          }
        });
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error);
        if (onError) {
          onError(-1);
        }
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying YouTube player:', e);
        }
      }
    };
  }, [videoId, onError, startMuted, volume, isMuted]);

  const handlePlay = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    
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
      console.error('Play/pause error:', error);
    }
  }, [isReady, isPlaying, needsGesture, completeGesture, volume, saveVolumeState]);

  const handleMute = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    
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
      console.error('Mute toggle error:', error);
    }
  }, [isReady, isMuted, volume, needsGesture, completeGesture, saveVolumeState]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!playerRef.current || !isReady) return;
    
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
      console.error('Volume change error:', error);
    }
  }, [isReady, isMuted, needsGesture, completeGesture, saveVolumeState]);

  const handleEnableAudio = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    
    try {
      completeGesture();
      playerRef.current.unMute();
      playerRef.current.playVideo();
      setIsMuted(false);
      setIsPlaying(true);
      saveVolumeState(volume, false);
    } catch (error) {
      console.error('Enable audio error:', error);
    }
  }, [isReady, completeGesture, volume, saveVolumeState]);

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-lg bg-black/10 ${className}`}>
      {/* YouTube Player Container */}
      <div 
        ref={containerRef}
        className="w-full h-full aspect-video"
        style={{ minHeight: '200px' }}
      />
      
      {/* Enable Audio Overlay */}
      {needsGesture && (
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}