import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Heart, Eye, Sparkles } from "lucide-react";
import { readVisionThumbs } from "@/lib/topbarState";
import { getRandomEncouragement } from "@/lib/encouragement";
import { onChanged } from "@/lib/bus";
import { useNavigate } from "react-router-dom";

export default function InspirationCorner() {
  const navigate = useNavigate();
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [encouragementText, setEncouragementText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshInspiration = () => {
    const visionImages = readVisionThumbs(10);
    if (visionImages.length > 0) {
      const randomImage = visionImages[Math.floor(Math.random() * visionImages.length)];
      setVisionImage(randomImage);
    }
    
    setEncouragementText(getRandomEncouragement());
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    refreshInspiration();
    
    // Listen for vision updates
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_vision_v1") || keys.includes("fm_cabinet_v1") || keys.includes("fm_future_notes_v1")) {
        refreshInspiration();
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Inspiration Corner
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshInspiration}
          className="h-8 w-8 p-0 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Vision Image */}
      {visionImage ? (
        <div 
          className="w-full rounded-lg overflow-hidden bg-muted/20 cursor-pointer hover:scale-105 transition-transform group relative"
          onClick={() => navigate('/tools/vision')}
        >
          <img
            src={visionImage}
            alt="Vision inspiration"
            className="inspo-media"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ) : (
        <div 
          className="w-full max-h-[420px] rounded-lg bg-white border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform p-8 shadow-sm"
          onClick={() => navigate('/tools/vision')}
        >
          <div className="text-center text-purple-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Add vision images</p>
          </div>
        </div>
      )}

      {/* Encouragement Text */}
      <div className="p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg border border-blue-100/50">
        <p className="text-sm text-center text-foreground font-medium leading-relaxed">
          "{encouragementText}"
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/tools/vision')}
          className="text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          Vision Board
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/tools/cabinet')}
          className="text-xs"
        >
          <Heart className="w-3 h-3 mr-1" />
          Cabinet
        </Button>
      </div>
    </div>
  );
}