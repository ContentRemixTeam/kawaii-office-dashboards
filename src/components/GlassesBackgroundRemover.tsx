import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

export const GlassesBackgroundRemover = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const processGlassesImage = async () => {
    setIsProcessing(true);
    try {
      // Load the existing glasses image
      const response = await fetch('/characters/customization/accessories/glasses-round.png');
      const blob = await response.blob();
      
      // Load as HTML image element
      const imageElement = await loadImage(blob);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Create URL for preview
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      
      // Download the processed image
      const link = document.createElement('a');
      link.href = processedUrl;
      link.download = 'glasses-round-transparent.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success!",
        description: "Background removed and image downloaded",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove background from glasses image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Glasses Background Remover</h2>
      
      <div className="flex gap-4">
        <div className="space-y-2">
          <h3 className="font-medium">Original</h3>
          <img 
            src="/characters/customization/accessories/glasses-round.png" 
            alt="Original glasses"
            className="w-32 h-32 object-contain border border-border rounded"
          />
        </div>
        
        {processedImage && (
          <div className="space-y-2">
            <h3 className="font-medium">Processed (Transparent)</h3>
            <img 
              src={processedImage} 
              alt="Processed glasses"
              className="w-32 h-32 object-contain border border-border rounded bg-checkerboard"
            />
          </div>
        )}
      </div>
      
      <Button 
        onClick={processGlassesImage}
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Removing Background...' : 'Remove Background & Download'}
      </Button>
    </div>
  );
};