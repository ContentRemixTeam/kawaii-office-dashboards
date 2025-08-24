import { useState, useEffect, useRef } from "react";
import ToolShell from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Link2 } from "lucide-react";
import { safeGet, safeSet, generateId } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { emitChanged, KEY_VISION } from "@/lib/topbarState";

interface VisionImage {
  id: string;
  url: string;
  createdAt: string;
}

interface VisionData {
  items: Array<{
    kind: string;
    image_url: string;
    id: string;
    z: number;
    createdAt: string;
  }>;
}

export default function Vision() {
  const [images, setImages] = useState<VisionImage[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Migrate from old format if needed
    const oldData = safeGet<VisionImage[]>(KEY_VISION, []);
    const newData = safeGet<VisionData>(KEY_VISION, { items: [] });
    
    if (Array.isArray(oldData) && oldData.length > 0 && (!newData.items || newData.items.length === 0)) {
      // Migrate old format to new format
      const migratedItems = oldData.map((img, index) => ({
        kind: "image",
        image_url: img.url,
        id: img.id,
        z: index,
        createdAt: img.createdAt
      }));
      const migratedData: VisionData = { items: migratedItems };
      safeSet(KEY_VISION, migratedData);
      setImages(oldData);
    } else if (newData.items) {
      // Convert new format back to component format
      const convertedImages: VisionImage[] = newData.items.map(item => ({
        id: item.id,
        url: item.image_url,
        createdAt: item.createdAt
      }));
      setImages(convertedImages);
    }
  }, []);

  const saveImages = (newImages: VisionImage[]) => {
    setImages(newImages);
    
    // Convert to the format expected by TopBar
    const visionData: VisionData = {
      items: newImages.map((img, index) => ({
        kind: "image",
        image_url: img.url,
        id: img.id,
        z: index,
        createdAt: img.createdAt
      }))
    };
    
    safeSet(KEY_VISION, visionData);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('visionBoardUpdated'));
    // Emit change for TopBar updates
    emitChanged([KEY_VISION]);
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

  return (
    <ToolShell title="Vision Board">
      <div className="space-y-6">
        <div className="bg-gradient-kawaii rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3">🎨 Manifest Your Dreams</h2>
          <p className="text-white/90">
            Create a beautiful visual representation of your goals and dreams. Add inspiring images and watch your vision come to life!
          </p>
        </div>

        {/* Add Images Section */}
        <div className="bg-card rounded-xl p-6 border border-border/20">
          <h3 className="font-semibold text-card-foreground mb-4">Add Images</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            
            <Button
              onClick={() => setIsAddingUrl(!isAddingUrl)}
              variant="outline"
              className="flex-1"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Add URL
            </Button>
          </div>

          {isAddingUrl && (
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Paste image URL here..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addImageFromUrl()}
                className="flex-1"
              />
              <Button onClick={addImageFromUrl}>Add</Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Vision Board Grid */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">
            Your Vision Board ({images.length} images)
          </h3>
          
          {images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">🌟 Your vision board is waiting</p>
              <p>Add some inspiring images to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border/20 hover:shadow-lg transition-shadow">
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
                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}