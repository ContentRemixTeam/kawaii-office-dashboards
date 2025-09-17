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
let scriptElement: HTMLScriptElement | null = null;

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

    // Check if API is already loaded
    if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
      console.log('YouTube API: Already loaded and functional');
      globalAPIState = 'ready';
      globalRetryCount = 0;
      notifyListeners();
      return Promise.resolve();
    }

    globalAPIState = 'loading';
    setError(null);
    notifyListeners();

    console.log('YouTube API: Starting simplified load process');

    loadPromise = new Promise<void>((resolve, reject) => {
      try {
        // Clean up any existing script
        if (scriptElement) {
          scriptElement.remove();
          scriptElement = null;
        }

        // Remove any existing scripts with same src
        const existingScripts = document.querySelectorAll('script[src*="youtube.com/iframe_api"]');
        existingScripts.forEach(script => script.remove());

        // Create new script element
        scriptElement = document.createElement('script');
        scriptElement.src = 'https://www.youtube.com/iframe_api';
        scriptElement.async = true;
        
        scriptElement.onerror = () => {
          console.error('YouTube API: Script load failed');
          const errorMsg = 'Failed to load YouTube API';
          setError(errorMsg);
          globalAPIState = 'error';
          notifyListeners();
          loadPromise = null;
          reject(new Error(errorMsg));
        };

        // Set up global callback
        window.onYouTubeIframeAPIReady = () => {
          console.log('YouTube API: Callback triggered, verifying...');
          
          // Small delay for API initialization
          setTimeout(() => {
            if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
              console.log('YouTube API: Successfully loaded and verified');
              globalAPIState = 'ready';
              globalRetryCount = 0;
              notifyListeners();
              loadPromise = null;
              resolve();
            } else {
              console.error('YouTube API: Callback triggered but API not functional');
              const errorMsg = 'YouTube API loaded but not functional';
              setError(errorMsg);
              globalAPIState = 'error';
              notifyListeners();
              loadPromise = null;
              reject(new Error(errorMsg));
            }
          }, 100);
        };

        // Add script to document
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(scriptElement, firstScript);
        } else {
          document.head.appendChild(scriptElement);
        }

        console.log('YouTube API: Script added to document');

        // Timeout fallback
        setTimeout(() => {
          if (globalAPIState === 'loading') {
            console.error('YouTube API: Load timeout');
            const errorMsg = 'YouTube API load timeout';
            setError(errorMsg);
            globalAPIState = 'error';
            notifyListeners();
            loadPromise = null;
            reject(new Error(errorMsg));
          }
        }, 15000); // 15 second timeout

      } catch (err) {
        console.error('YouTube API: Error during load:', err);
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
    console.log('YouTube API: Manual retry triggered');
    setError(null);
    globalAPIState = 'idle';
    globalRetryCount = 0;
    loadPromise = null;
    
    // Clean up existing script
    if (scriptElement) {
      scriptElement.remove();
      scriptElement = null;
    }
    
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