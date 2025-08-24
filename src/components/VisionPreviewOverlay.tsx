import { useState, useEffect } from "react";

interface VisionPreviewOverlayProps {
  boardBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface VisionImage {
  id: string;
  url: string;
  createdAt: string;
}

const STORAGE_KEY = "fm_vision_v1";

export default function VisionPreviewOverlay({ boardBox }: VisionPreviewOverlayProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const loadImages = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setImageUrls([]);
        return;
      }

      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) {
        setImageUrls([]);
        return;
      }

      // Handle both string URLs and objects with url property
      const urls = arr
        .map((x: any) => typeof x === 'string' ? x : x?.url)
        .filter(Boolean)
        .slice(0, 6); // Limit to 6 images max

      setImageUrls(urls);
    } catch (error) {
      console.error('Error loading vision images:', error);
      setImageUrls([]);
    }
  };

  useEffect(() => {
    // Load images on mount
    loadImages();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadImages();
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab updates (since storage event doesn't fire in same tab)
    const handleVisionUpdate = () => {
      loadImages();
    };

    window.addEventListener('visionBoardUpdated', handleVisionUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('visionBoardUpdated', handleVisionUpdate);
    };
  }, []);

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        top: `${boardBox.top}%`,
        left: `${boardBox.left}%`,
        width: `${boardBox.width}%`,
        height: `${boardBox.height}%`,
      }}
    >
      <div className="w-full h-full p-1 md:p-2">
        {imageUrls.length === 0 ? (
          // Placeholder when no images
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border-2 border-dashed border-amber-200 dark:border-amber-700 flex items-center justify-center">
            <div className="text-center p-1">
              <div className="text-xs md:text-sm text-amber-600 dark:text-amber-400 font-medium">
                📌 Vision Board
              </div>
              <div className="text-[10px] md:text-xs text-amber-500 dark:text-amber-500 mt-1 hidden md:block">
                Add images →
              </div>
            </div>
          </div>
        ) : (
          // Image collage
          <div className={`w-full h-full grid gap-0.5 md:gap-1 rounded-lg overflow-hidden shadow-inner ${
            imageUrls.length <= 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2 md:grid-cols-3 grid-rows-2'
          }`}>
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative overflow-hidden bg-muted"
              >
                <img
                  src={url}
                  alt={`Vision ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </div>
            ))}
            
            {/* Fill remaining slots with subtle pattern for layout */}
            {Array.from({ length: Math.max(0, (imageUrls.length <= 4 ? 4 : 6) - imageUrls.length) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-gradient-to-br from-muted/50 to-muted opacity-30"
              />
            ))}
          </div>
        )}
        
        {/* Pin effect overlay */}
        <div className="absolute top-1 left-1 w-1 h-1 md:w-1.5 md:h-1.5 bg-red-400 rounded-full shadow-sm" />
        <div className="absolute top-1 right-1 w-1 h-1 md:w-1.5 md:h-1.5 bg-red-400 rounded-full shadow-sm" />
      </div>
    </div>
  );
}