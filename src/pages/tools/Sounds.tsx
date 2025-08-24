import { useState, useEffect, useRef } from "react";
import ToolShell from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";
import { safeGet, safeSet } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface SoundState {
  activeSounds: string[];
  volume: number;
}

const STORAGE_KEY = "fm_sounds_v1";

const sounds = [
  { id: "rain", name: "Rain", emoji: "🌧", file: "/sounds/rain.mp3" },
  { id: "cafe", name: "Café", emoji: "☕", file: "/sounds/cafe.mp3" },
  { id: "fireplace", name: "Fireplace", emoji: "🔥", file: "/sounds/fireplace.mp3" },
  { id: "ocean", name: "Ocean", emoji: "🌊", file: "/sounds/ocean.mp3" },
  { id: "birds", name: "Birds", emoji: "🐦", file: "/sounds/birds.mp3" },
  { id: "lofi", name: "Lofi", emoji: "🎶", file: "/sounds/lofi.mp3" }
];

export default function Sounds() {
  const [activeSounds, setActiveSounds] = useState<string[]>([]);
  const [volume, setVolume] = useState(50);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const { toast } = useToast();

  // Initialize audio elements
  useEffect(() => {
    const elements: { [key: string]: HTMLAudioElement } = {};
    
    sounds.forEach(sound => {
      const audio = new Audio(sound.file);
      audio.loop = true;
      audio.preload = "metadata";
      elements[sound.id] = audio;
      audioRefs.current[sound.id] = audio;
    });
    
    setAudioElements(elements);
  }, []);

  // Load saved state
  useEffect(() => {
    const savedState = safeGet<SoundState>(STORAGE_KEY, { activeSounds: [], volume: 50 });
    setActiveSounds(savedState.activeSounds);
    setVolume(savedState.volume);
  }, []);

  // Update volume for all audio elements
  useEffect(() => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.volume = volume / 100;
    });
  }, [volume]);

  // Save state to localStorage
  const saveState = (newActiveSounds: string[], newVolume: number) => {
    safeSet(STORAGE_KEY, { activeSounds: newActiveSounds, volume: newVolume });
  };

  const toggleSound = async (soundId: string) => {
    const audio = audioRefs.current[soundId];
    if (!audio) return;

    try {
      if (activeSounds.includes(soundId)) {
        // Stop the sound
        audio.pause();
        audio.currentTime = 0;
        const newActiveSounds = activeSounds.filter(id => id !== soundId);
        setActiveSounds(newActiveSounds);
        saveState(newActiveSounds, volume);
        
        toast({
          title: `${sounds.find(s => s.id === soundId)?.name} stopped`,
          description: "Sound has been paused."
        });
      } else {
        // Start the sound
        audio.volume = volume / 100;
        await audio.play();
        const newActiveSounds = [...activeSounds, soundId];
        setActiveSounds(newActiveSounds);
        saveState(newActiveSounds, volume);
        
        toast({
          title: `${sounds.find(s => s.id === soundId)?.name} playing`,
          description: "Ambient sound is now active."
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio error",
        description: "Unable to play this sound. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    saveState(activeSounds, volumeValue);
  };

  const stopAllSounds = () => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setActiveSounds([]);
    saveState([], volume);
    
    toast({
      title: "All sounds stopped",
      description: "Ambient soundscape cleared."
    });
  };

  return (
    <ToolShell title="Soundscapes & Ambience">
      <div className="space-y-6">
        <div className="bg-gradient-mint rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-secondary-foreground mb-3">🎵 Ambient Atmosphere</h2>
          <p className="text-secondary-foreground/80">
            Create the perfect working atmosphere with soothing soundscapes. Mix and match different ambient sounds to find your ideal focus environment.
          </p>
        </div>

        {/* Volume Control */}
        <div className="bg-card rounded-xl p-6 border border-border/20">
          <div className="flex items-center gap-4 mb-4">
            <VolumeX className="w-5 h-5 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground w-12">{volume}%</span>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Active sounds: {activeSounds.length}
            </p>
            {activeSounds.length > 0 && (
              <Button variant="outline" size="sm" onClick={stopAllSounds}>
                Stop All
              </Button>
            )}
          </div>
        </div>

        {/* Sound Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sounds.map((sound) => {
            const isActive = activeSounds.includes(sound.id);
            return (
              <Button
                key={sound.id}
                variant={isActive ? "default" : "outline"}
                size="lg"
                onClick={() => toggleSound(sound.id)}
                className={`h-24 flex flex-col gap-2 text-base transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" 
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span className="text-2xl">{sound.emoji}</span>
                <span className="font-medium">{sound.name}</span>
                {isActive && (
                  <span className="text-xs opacity-75">Playing</span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="bg-muted/30 rounded-xl p-4 border border-border/10">
          <h3 className="font-medium text-foreground mb-2">🎧 How to use</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Click any sound button to start/stop ambient audio</li>
            <li>• Mix multiple sounds together for your perfect atmosphere</li>
            <li>• Adjust the volume slider to control all active sounds</li>
            <li>• Your preferences are automatically saved</li>
          </ul>
        </div>
      </div>
    </ToolShell>
  );
}