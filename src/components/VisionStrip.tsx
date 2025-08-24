import React from "react";
import { useNavigate } from "react-router-dom";
import { readVisionThumbs, KEY_VISION } from "@/lib/topbarState";
import { onChanged } from "@/lib/bus";

export default function VisionStrip() {
  const navigate = useNavigate();
  const [thumbs, setThumbs] = React.useState<string[]>([]);

  const refresh = React.useCallback(() => setThumbs(readVisionThumbs(5)), []);
  
  React.useEffect(() => {
    refresh();
    return onChanged(keys => { 
      if (keys.includes(KEY_VISION)) refresh(); 
    });
  }, [refresh]);

  const handleClick = () => {
    navigate("/tools/vision");
  };

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-muted-foreground text-sm">Hold your vision close 💫</p>
      </div>
      
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/20 p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            🌟 Hold the Vision
          </h3>
          <button 
            onClick={handleClick}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View Full Board →
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          {thumbs.length ? thumbs.map((src, i) => (
            <img 
              key={i} 
              src={src} 
              alt="Vision" 
              className="h-24 w-24 flex-shrink-0 object-cover rounded-xl border border-border/20 bg-background cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm" 
              onClick={handleClick}
            />
          )) : (
            <div className="flex-1 text-center py-8">
              <div className="text-3xl mb-2">🌟</div>
              <div className="text-sm text-muted-foreground">
                No images yet.{" "}
                <button 
                  onClick={handleClick}
                  className="text-primary underline hover:text-primary/80"
                >
                  Start your vision board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}