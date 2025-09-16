import { useState, useEffect, useRef } from 'react';

export type YouTubeAPIState = 'idle' | 'loading' | 'ready' | 'error';

interface UseYouTubeAPIResult {
  state: YouTubeAPIState;
  isReady: boolean;
  error: string | null;
  retryCount: number;
  loadAPI: () => Promise<void>;
  retry: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let globalAPIState: YouTubeAPIState = 'idle';
let globalListeners: Set<() => void> = new Set();
let loadPromise: Promise<void> | null = null;

export function useYouTubeAPI(): UseYouTubeAPIResult {
  const [state, setState] = useState<YouTubeAPIState>(globalAPIState);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const listenerRef = useRef<() => void>();

  useEffect(() => {
    // Create listener function
    const listener = () => {
      setState(globalAPIState);
    };
    
    listenerRef.current = listener;
    globalListeners.add(listener);

    // Set initial state
    setState(globalAPIState);

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
    // If already loading, return existing promise
    if (loadPromise) {
      return loadPromise;
    }

    // If already ready, resolve immediately
    if (globalAPIState === 'ready') {
      return Promise.resolve();
    }

    globalAPIState = 'loading';
    setError(null);
    notifyListeners();

    loadPromise = new Promise<void>((resolve, reject) => {
      try {
        // Check if API is already loaded
        if (window.YT && window.YT.Player) {
          // Test that the API actually works
          try {
            // This will throw if API isn't fully ready
            const testDiv = document.createElement('div');
            testDiv.style.display = 'none';
            document.body.appendChild(testDiv);
            
            const testPlayer = new window.YT.Player(testDiv, {
              height: '100',
              width: '100',
              videoId: 'dQw4w9WgXcQ', // Test video
              events: {
                onReady: () => {
                  try {
                    testPlayer.destroy();
                    document.body.removeChild(testDiv);
                  } catch (e) {
                    // Ignore cleanup errors
                  }
                  globalAPIState = 'ready';
                  notifyListeners();
                  loadPromise = null;
                  resolve();
                },
                onError: () => {
                  try {
                    testPlayer.destroy();
                    document.body.removeChild(testDiv);
                  } catch (e) {
                    // Ignore cleanup errors
                  }
                  throw new Error('YouTube API test failed');
                }
              }
            });
            return;
          } catch (e) {
            // API not fully ready, continue with loading
          }
        }

        // Remove any existing script tags to avoid conflicts
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Load YouTube API
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        
        tag.onerror = () => {
          const errorMsg = `Failed to load YouTube API (attempt ${retryCount + 1})`;
          setError(errorMsg);
          globalAPIState = 'error';
          notifyListeners();
          loadPromise = null;
          reject(new Error(errorMsg));
        };

        // Set up global callback
        window.onYouTubeIframeAPIReady = () => {
          // Additional verification that API is truly ready
          setTimeout(() => {
            if (window.YT && window.YT.Player) {
              globalAPIState = 'ready';
              notifyListeners();
              loadPromise = null;
              resolve();
            } else {
              const errorMsg = 'YouTube API loaded but not functional';
              setError(errorMsg);
              globalAPIState = 'error';
              notifyListeners();
              loadPromise = null;
              reject(new Error(errorMsg));
            }
          }, 100);
        };

        // Add script to page
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // Timeout fallback
        setTimeout(() => {
          if (globalAPIState === 'loading') {
            const errorMsg = 'YouTube API load timeout';
            setError(errorMsg);
            globalAPIState = 'error';
            notifyListeners();
            loadPromise = null;
            reject(new Error(errorMsg));
          }
        }, 15000);

      } catch (err) {
        const errorMsg = `YouTube API initialization failed: ${err}`;
        setError(errorMsg);
        globalAPIState = 'error';
        notifyListeners();
        loadPromise = null;
        reject(new Error(errorMsg));
      }
    });

    return loadPromise;
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    globalAPIState = 'idle';
    loadPromise = null;
    notifyListeners();
  };

  return {
    state,
    isReady: state === 'ready',
    error,
    retryCount,
    loadAPI,
    retry
  };
}