import React from "react";
import { useNavigate } from "react-router-dom";
import { readVisionThumbs, KEY_VISION } from "@/lib/topbarState";
import { onChanged } from "@/lib/bus";

export default function VisionPanel({ side = false }: { side?: boolean }) {
  const navigate = useNavigate();
  const [thumbs, setThumbs] = React.useState<string[]>([]);

  const refresh = React.useCallback(() => setThumbs(readVisionThumbs(6)), []);
  
  React.useEffect(() => {
    refresh();
    return onChanged(keys => { 
      if (keys.includes(KEY_VISION)) refresh(); 
    });
  }, [refresh]);

  const handleClick = () => {
    navigate("/tools/vision");
  };

  const grid = (
    <div className="grid grid-cols-3 gap-2">
      {thumbs.length ? thumbs.map((src, i) => (
        <img 
          key={i} 
          src={src} 
          alt="Vision" 
          className="h-20 w-full object-cover rounded-lg border border-border/20 bg-background cursor-pointer hover:scale-105 transition-transform duration-200" 
          onClick={handleClick}
        />
      )) : (
        <div className="col-span-3 text-center py-8">
          <div className="text-4xl mb-2">🌟</div>
          <div className="text-sm text-muted-foreground">
            No images yet. Start building your{" "}
            <button 
              onClick={handleClick}
              className="text-primary underline hover:text-primary/80"
            >
              Vision Board
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${side ? "xl:sticky xl:top-[100px]" : ""}`}>
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-sm shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-card-foreground">
            Hold the Vision ✨
          </h3>
          <button 
            onClick={handleClick}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Open board →
          </button>
        </div>
        {grid}
      </div>
    </div>
  );
}