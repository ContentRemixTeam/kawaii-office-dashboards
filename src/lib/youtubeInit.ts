/**
 * Global YouTube API initialization system
 * This file handles early YouTube API loading for optimal performance
 */

// Global state for YouTube API initialization
let isInitialized = false;
let initPromise: Promise<void> | null = null;

declare global {
  interface Window {
    youTubeGlobalReady?: boolean;
  }
}

/**
 * Initialize YouTube API as early as possible in the app lifecycle
 * This should be called from the main App component or index.html
 */
export async function initializeYouTubeAPI(): Promise<void> {
  // Prevent multiple initializations
  if (isInitialized || initPromise) {
    return initPromise || Promise.resolve();
  }

  console.log('YouTubeInit: Starting global initialization');

  initPromise = new Promise<void>((resolve, reject) => {
    try {
      // Check if already loaded
      if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
        console.log('YouTubeInit: API already available');
        isInitialized = true;
        window.youTubeGlobalReady = true;
        resolve();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (existingScript) {
        console.log('YouTubeInit: Script already exists, waiting for callback');
      } else {
        // Create and load script
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
          console.error('YouTubeInit: Failed to load script');
          reject(new Error('Failed to load YouTube API script'));
        };

        document.head.appendChild(script);
        console.log('YouTubeInit: Script added to document head');
      }

      // Set up global callback
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTubeInit: Global callback triggered');
        
        // Verify API is functional
        setTimeout(() => {
          if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
            console.log('YouTubeInit: API successfully initialized globally');
            isInitialized = true;
            window.youTubeGlobalReady = true;
            resolve();
          } else {
            console.error('YouTubeInit: API not functional after callback');
            reject(new Error('YouTube API not functional'));
          }
        }, 100);
      };

      // Timeout fallback
      setTimeout(() => {
        if (!isInitialized) {
          console.error('YouTubeInit: Global initialization timeout');
          reject(new Error('YouTube API initialization timeout'));
        }
      }, 15000);

    } catch (error) {
      console.error('YouTubeInit: Error during initialization:', error);
      reject(error);
    }
  });

  return initPromise;
}

/**
 * Check if YouTube API is ready for use
 */
export function isYouTubeAPIReady(): boolean {
  return isInitialized && 
         window.youTubeGlobalReady === true && 
         window.YT && 
         window.YT.Player && 
         typeof window.YT.Player === 'function';
}

/**
 * Get a promise that resolves when YouTube API is ready
 */
export async function waitForYouTubeAPI(): Promise<void> {
  if (isYouTubeAPIReady()) {
    return Promise.resolve();
  }

  if (initPromise) {
    return initPromise;
  }

  return initializeYouTubeAPI();
}

/**
 * Reset the initialization state (for testing or error recovery)
 */
export function resetYouTubeAPI(): void {
  isInitialized = false;
  initPromise = null;
  window.youTubeGlobalReady = false;
  
  // Remove existing scripts
  const scripts = document.querySelectorAll('script[src*="youtube.com/iframe_api"]');
  scripts.forEach(script => script.remove());
  
  // Clear callback
  window.onYouTubeIframeAPIReady = () => {};
  
  console.log('YouTubeInit: State reset');
}