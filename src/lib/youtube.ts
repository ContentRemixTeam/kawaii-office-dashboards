// YouTube URL parsing utilities

export function extractYouTubeId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  
  // Clean the input
  const url = input.trim();
  
  // Regular expression patterns for different YouTube URL formats
  const patterns = [
    // https://www.youtube.com/watch?v=ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    // https://youtu.be/ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    // https://www.youtube.com/embed/ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    // Any URL with ?v=ID in query string
    /[?&]v=([a-zA-Z0-9_-]+)/,
    // Just the ID if it's 11 characters long (YouTube video ID length)
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Legacy function for backward compatibility
export function getYouTubeId(url: string): string | null {
  return extractYouTubeId(url);
}

// Build embed URL (keeping existing function for compatibility)
export function buildEmbedSrc(inputUrl: string, options: Record<string, any> = {}): string {
  const videoId = extractYouTubeId(inputUrl);
  if (!videoId) return '';
  
  const params = new URLSearchParams({
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
    modestbranding: '1',
    disablekb: '1',
    fs: '0',
    cc_load_policy: '0',
    playsinline: '1',
    ...options
  });
  
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

// Parse YouTube target (keeping for compatibility)
export interface YTTarget {
  id: string;
  isPlaylist: boolean;
}

export function parseYouTubeTarget(url: string): YTTarget | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  
  return {
    id: videoId,
    isPlaylist: false
  };
}
