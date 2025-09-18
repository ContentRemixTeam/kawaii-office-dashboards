import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Target, Upload, Link2, Sparkles, ExternalLink, X } from "lucide-react";
import { safeGet, safeSet, generateId } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface VisionImage {
  id: string;
  url: string;
  createdAt: string;
}

export default function VisionBoardSection() {
  const navigate = useNavigate();
  const [images, setImages] = useState<VisionImage[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Import starter images (using public paths for better compatibility)
  const STARTER_IMAGES = [
    { url: "/src/assets/vision-starter-mountain-lake.jpg", title: "Mountain Lake" },
    { url: "/src/assets/vision-starter-dream-big.jpg", title: "Dream Big" },
    { url: "/src/assets/vision-starter-tropical-paradise.jpg", title: "Paradise" },
    { url: "/src/assets/vision-starter-success-quote.jpg", title: "Success" },
    { url: "/src/assets/vision-starter-city-skyline.jpg", title: "City Life" },
    { url: "/src/assets/vision-starter-limit-quote.jpg", title: "No Limits" }
  ];

  useEffect(() => {
    const savedImages = safeGet<VisionImage[]>("fm_vision_board_v1", []);
    setImages(savedImages);
  }, []);

  const saveImages = (newImages: VisionImage[]) => {
    setImages(newImages);
    safeSet("fm_vision_board_v1", newImages);
  };

  const addImageFromUrl = () => {
    if (!urlInput.trim()) {
      toast({
        title: "Please enter a URL",
        description: "Add a valid image URL to your vision board.",
        variant: "destructive"
      });
      return;
    }

    const newImage: VisionImage = {
      id: generateId(),
      url: urlInput.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedImages = [...images, newImage];
    saveImages(updatedImages);
    setUrlInput("");
    setIsAddingUrl(false);
    
    toast({
      title: "Image added! ✨",
      description: "Your vision is taking shape."
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const newImage: VisionImage = {
          id: generateId(),
          url: result,
          createdAt: new Date().toISOString()
        };

        const updatedImages = [...images, newImage];
        saveImages(updatedImages);
        
        toast({
          title: "Image uploaded! ✨",
          description: "Your vision is growing."
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    saveImages(updatedImages);
    
    toast({
      title: "Image removed",
      description: "Image deleted from your vision board."
    });
  };

  const addStarterImages = () => {
    const newImages: VisionImage[] = STARTER_IMAGES.map(starter => ({
      id: generateId(),
      url: starter.url,
      createdAt: new Date().toISOString()
    }));

    const updatedImages = [...images, ...newImages];
    saveImages(updatedImages);
    
    toast({
      title: "Starter images added! ✨",
      description: "Your vision board now has inspiring examples."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          🎯 Vision Board
        </CardTitle>
        <CardDescription>
          Create a visual collage of your dreams and goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Images Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
          
          <Button
            onClick={() => setIsAddingUrl(!isAddingUrl)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Add URL
          </Button>

          {images.length === 0 && (
            <Button
              onClick={addStarterImages}
              size="sm"
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Add Starter Pack
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/tools/vision')}
            variant="secondary"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Full Editor
          </Button>
        </div>

        {isAddingUrl && (
          <div className="flex gap-2">
            <Input
              placeholder="Paste image URL here..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addImageFromUrl()}
              className="flex-1"
            />
            <Button onClick={addImageFromUrl} size="sm">Add</Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Vision Board Grid */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your Vision Board ({images.length} images)
          </p>
          
          {images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
              <p className="mb-2">🌟 Start building your dream board</p>
              <p className="text-xs">Upload photos or add URLs to visualize your goals</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border/20 hover:shadow-md transition-shadow">
                    <img
                      src={image.url}
                      alt="Vision board image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EImage not found%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(image.id)}
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}