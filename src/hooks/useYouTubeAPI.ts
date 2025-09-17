import { useState, useEffect, useRef } from 'react';

export type YouTubeAPIState = 'idle' | 'loading' | 'ready' | 'error';

interface UseYouTubeAPIResult {
  state: YouTubeAPIState;
  isReady: boolean;
  error: string | null;
  retryCount: number;
  loadAPI: () => Promise<void>;
  retry: () => void;
  isConnected: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    youTubeAPIReady?: boolean;
  }
}

// Global state management for YouTube API
let globalAPIState: YouTubeAPIState = 'idle';
let globalListeners: Set<() => void> = new Set();
let loadPromise: Promise<void> | null = null;
let globalRetryCount = 0;
let scriptElement: HTMLScriptElement | null = null;
let connectionStatus = navigator.onLine;

// Enhanced connection monitoring
window.addEventListener('online', () => {
  connectionStatus = true;
  console.log('YouTube API: Network connection restored');
});

window.addEventListener('offline', () => {
  connectionStatus = false;
  console.log('YouTube API: Network connection lost');
});

export function useYouTubeAPI(): UseYouTubeAPIResult {
  const [state, setState] = useState<YouTubeAPIState>(globalAPIState);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(globalRetryCount);
  const [isConnected, setIsConnected] = useState(connectionStatus);
  const listenerRef = useRef<() => void>();

  useEffect(() => {
    // Create listener function
    const listener = () => {
      setState(globalAPIState);
      setRetryCount(globalRetryCount);
      setIsConnected(connectionStatus);
    };
    
    listenerRef.current = listener;
    globalListeners.add(listener);

    // Set initial state
    setState(globalAPIState);
    setRetryCount(globalRetryCount);
    setIsConnected(connectionStatus);

    return () => {
      if (listenerRef.current) {
        globalListeners.delete(listenerRef.current);
      }
    };
  }, []);

  const notifyListeners = () => {
    globalListeners.forEach(listener => listener());
  };

  const loadAPI = async (): Promise<void> => {
    // Check network connectivity first
    if (!connectionStatus || !navigator.onLine) {
      const errorMsg = 'No internet connection available';
      setError(errorMsg);
      globalAPIState = 'error';
      notifyListeners();
      throw new Error(errorMsg);
    }

    // If already loading, return existing promise
    if (loadPromise) {
      console.log('YouTube API: Already loading, returning existing promise');
      return loadPromise;
    }

    // If already ready, resolve immediately
    if (globalAPIState === 'ready' && window.YT?.Player) {
      console.log('YouTube API: Already ready');
      return Promise.resolve();
    }

    // Check if API is already loaded and functional
    if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
      console.log('YouTube API: Already loaded and functional');
      globalAPIState = 'ready';
      globalRetryCount = 0;
      window.youTubeAPIReady = true;
      notifyListeners();
      return Promise.resolve();
    }

    console.log('YouTube API: Starting enhanced load process');
    globalAPIState = 'loading';
    setError(null);
    notifyListeners();

    loadPromise = new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        loadPromise = null;
        if (timeoutId) clearTimeout(timeoutId);
      };

      let timeoutId: NodeJS.Timeout;

      try {
        // Clean up any existing scripts and callbacks
        if (scriptElement) {
          scriptElement.remove();
          scriptElement = null;
        }

        // Remove any existing YouTube API scripts
        const existingScripts = document.querySelectorAll('script[src*="youtube.com/iframe_api"]');
        existingScripts.forEach(script => script.remove());

        // Create new script element with enhanced error handling
        scriptElement = document.createElement('script');
        scriptElement.src = 'https://www.youtube.com/iframe_api';
        scriptElement.async = true;
        scriptElement.crossOrigin = 'anonymous';
        
        scriptElement.onerror = (event) => {
          console.error('YouTube API: Script load failed', event);
          cleanup();
          const errorMsg = 'Failed to load YouTube API script';
          setError(errorMsg);
          globalAPIState = 'error';
          globalRetryCount++;
          notifyListeners();
          reject(new Error(errorMsg));
        };

        scriptElement.onload = () => {
          console.log('YouTube API: Script loaded successfully');
        };

        // Enhanced global callback with better error handling
        window.onYouTubeIframeAPIReady = () => {
          console.log('YouTube API: Callback triggered, performing verification...');
          
          // Add a small delay for API stabilization
          setTimeout(() => {
            try {
              if (window.YT && 
                  window.YT.Player && 
                  typeof window.YT.Player === 'function' &&
                  window.YT.PlayerState) {
                
                console.log('YouTube API: Successfully loaded and verified');
                globalAPIState = 'ready';
                globalRetryCount = 0;
                window.youTubeAPIReady = true;
                cleanup();
                notifyListeners();
                resolve();
              } else {
                throw new Error('YouTube API not fully functional after callback');
              }
            } catch (err) {
              console.error('YouTube API: Verification failed:', err);
              cleanup();
              const errorMsg = 'YouTube API loaded but verification failed';
              setError(errorMsg);
              globalAPIState = 'error';
              globalRetryCount++;
              notifyListeners();
              reject(new Error(errorMsg));
            }
          }, 250); // Increased delay for better stability
        };

        // Add script to document with fallback insertion
        try {
          const head = document.head || document.getElementsByTagName('head')[0];
          const firstScript = document.getElementsByTagName('script')[0];
          
          if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(scriptElement, firstScript);
          } else if (head) {
            head.appendChild(scriptElement);
          } else {
            document.documentElement.appendChild(scriptElement);
          }
          
          console.log('YouTube API: Script successfully added to document');
        } catch (insertError) {
          console.error('YouTube API: Failed to insert script:', insertError);
          cleanup();
          throw insertError;
        }

        // Enhanced timeout with retry logic
        timeoutId = setTimeout(() => {
          if (globalAPIState === 'loading') {
            console.error('YouTube API: Load timeout after 12 seconds');
            cleanup();
            
            // Auto-retry logic for timeout
            if (globalRetryCount < 2) {
              console.log(`YouTube API: Auto-retry attempt ${globalRetryCount + 1}`);
              globalRetryCount++;
              globalAPIState = 'idle';
              notifyListeners();
              
              setTimeout(() => {
                loadAPI().then(resolve).catch(reject);
              }, 1000 * (globalRetryCount + 1)); // Exponential backoff
            } else {
              const errorMsg = 'YouTube API load timeout - please check your connection';
              setError(errorMsg);
              globalAPIState = 'error';
              notifyListeners();
              reject(new Error(errorMsg));
            }
          }
        }, 12000); // 12 second timeout

      } catch (err) {
        console.error('YouTube API: Critical error during initialization:', err);
        cleanup();
        const errorMsg = `YouTube API initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        globalAPIState = 'error';
        globalRetryCount++;
        notifyListeners();
        reject(new Error(errorMsg));
      }
    });

    return loadPromise;
  };

  const retry = () => {
    console.log('YouTube API: Manual retry triggered');
    setError(null);
    globalAPIState = 'idle';
    globalRetryCount = 0;
    loadPromise = null;
    window.youTubeAPIReady = false;
    
    // Clean up existing script and callbacks
    if (scriptElement) {
      scriptElement.remove();
      scriptElement = null;
    }
    
    // Remove callback
    window.onYouTubeIframeAPIReady = () => {};
    
    notifyListeners();
  };

  return {
    state,
    isReady: state === 'ready' && window.youTubeAPIReady === true,
    error,
    retryCount,
    loadAPI,
    retry,
    isConnected
  };
}