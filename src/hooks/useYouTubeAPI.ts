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
let globalRetryCount = 0;

export function useYouTubeAPI(): UseYouTubeAPIResult {
  const [state, setState] = useState<YouTubeAPIState>(globalAPIState);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(globalRetryCount);
  const listenerRef = useRef<() => void>();

  useEffect(() => {
    // Create listener function
    const listener = () => {
      setState(globalAPIState);
      setRetryCount(globalRetryCount);
    };
    
    listenerRef.current = listener;
    globalListeners.add(listener);

    // Set initial state
    setState(globalAPIState);
    setRetryCount(globalRetryCount);

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

    console.log('YouTube API: Starting load process');

    loadPromise = new Promise<void>((resolve, reject) => {
      let currentAttempt = 0;
      const maxAttempts = 3;

      const attemptLoad = () => {
        currentAttempt++;
        globalRetryCount = currentAttempt - 1;
        console.log(`YouTube API: Load attempt ${currentAttempt}/${maxAttempts}`);
        notifyListeners();

        try {
          // Check if API is already loaded and functional
          if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
            console.log('YouTube API: Already loaded and functional');
            globalAPIState = 'ready';
            globalRetryCount = 0;
            notifyListeners();
            loadPromise = null;
            resolve();
            return;
          }

          // Check network connectivity
          if (!navigator.onLine) {
            throw new Error('No internet connection');
          }

          // Remove any existing script tags to avoid conflicts
          const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
          if (existingScript) {
            existingScript.remove();
            console.log('YouTube API: Removed existing script');
          }

          // Load YouTube API
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          tag.async = true;
          
          tag.onerror = () => {
            console.error(`YouTube API: Script load failed on attempt ${currentAttempt}`);
            if (currentAttempt < maxAttempts) {
              setTimeout(() => attemptLoad(), 1000 * currentAttempt); // Exponential backoff
            } else {
              const errorMsg = `Failed to load YouTube API after ${maxAttempts} attempts`;
              setError(errorMsg);
              globalAPIState = 'error';
              globalRetryCount = maxAttempts;
              notifyListeners();
              loadPromise = null;
              reject(new Error(errorMsg));
            }
          };

          // Set up global callback with verification
          window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API: onYouTubeIframeAPIReady callback triggered');
            
            // Wait a bit for full initialization, then verify
            setTimeout(() => {
              try {
                if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
                  console.log('YouTube API: Successfully loaded and verified');
                  globalAPIState = 'ready';
                  globalRetryCount = 0;
                  notifyListeners();
                  loadPromise = null;
                  resolve();
                } else {
                  console.error('YouTube API: Callback triggered but API not functional', {
                    hasYT: !!window.YT,
                    hasPlayer: !!(window.YT && window.YT.Player),
                    playerIsFunction: !!(window.YT && typeof window.YT.Player === 'function')
                  });
                  if (currentAttempt < maxAttempts) {
                    setTimeout(() => attemptLoad(), 1000 * currentAttempt);
                  } else {
                    const errorMsg = 'YouTube API loaded but not functional';
                    setError(errorMsg);
                    globalAPIState = 'error';
                    globalRetryCount = maxAttempts;
                    notifyListeners();
                    loadPromise = null;
                    reject(new Error(errorMsg));
                  }
                }
              } catch (e) {
                console.error('YouTube API: Error during verification:', e);
                if (currentAttempt < maxAttempts) {
                  setTimeout(() => attemptLoad(), 1000 * currentAttempt);
                } else {
                  const errorMsg = 'YouTube API verification failed';
                  setError(errorMsg);
                  globalAPIState = 'error';
                  globalRetryCount = maxAttempts;
                  notifyListeners();
                  loadPromise = null;
                  reject(new Error(errorMsg));
                }
              }
            }, 500);
          };

          // Add script to page
          const firstScriptTag = document.getElementsByTagName('script')[0];
          if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            console.log('YouTube API: Script added to page');
          } else {
            document.head.appendChild(tag);
            console.log('YouTube API: Script added to head');
          }

          // Timeout fallback with retry logic
          setTimeout(() => {
            if (globalAPIState === 'loading') {
              console.error(`YouTube API: Load timeout on attempt ${currentAttempt}`);
              if (currentAttempt < maxAttempts) {
                setTimeout(() => attemptLoad(), 1000 * currentAttempt);
              } else {
                const errorMsg = 'YouTube API load timeout after all attempts';
                setError(errorMsg);
                globalAPIState = 'error';
                globalRetryCount = maxAttempts;
                notifyListeners();
                loadPromise = null;
                reject(new Error(errorMsg));
              }
            }
          }, 10000); // 10 second timeout per attempt

        } catch (err) {
          console.error(`YouTube API: Error on attempt ${currentAttempt}:`, err);
          if (currentAttempt < maxAttempts) {
            setTimeout(() => attemptLoad(), 1000 * currentAttempt);
          } else {
            const errorMsg = `YouTube API initialization failed: ${err}`;
            setError(errorMsg);
            globalAPIState = 'error';
            globalRetryCount = maxAttempts;
            notifyListeners();
            loadPromise = null;
            reject(new Error(errorMsg));
          }
        }
      };

      attemptLoad();
    });

    return loadPromise;
  };

  const retry = () => {
    console.log('YouTube API: Manual retry triggered');
    setError(null);
    globalAPIState = 'idle';
    globalRetryCount = 0;
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