import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, RotateCcw, Save, Upload } from "lucide-react";
import ToolShell from "@/components/ToolShell";
import { safeGet, safeSet } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { loadHero, saveHero, OFFICE_IMAGES, HeroState } from "@/lib/heroStore";

interface ThemeData {
  vars: {
    "--bg-start": string;
    "--bg-end": string;
    "--brand": string;
    "--brand-fg": string;
    "--accent": string;
    "--accent-fg": string;
    "--card": string;
    "--text": string;
    "--muted": string;
    "--ring": string;
  };
  backgroundImage?: string;
  useImage?: boolean;
}

const DEFAULT_THEME: ThemeData = {
  vars: {
    "--bg-start": "350 100% 98%",    // pastel pink
    "--bg-end": "150 40% 96%",       // mint
    "--brand": "340 75% 75%",        // pink accent
    "--brand-fg": "0 0% 100%",       // white text on brand
    "--accent": "150 60% 65%",       // mint accent
    "--accent-fg": "160 30% 25%",    // dark text on accent
    "--card": "0 0% 100%",           // white
    "--text": "340 15% 25%",         // dark gray
    "--muted": "340 10% 45%",        // secondary text
    "--ring": "340 75% 85%"          // focus ring
  }
};

const THEME_PRESETS = [
  {
    name: "Cotton Candy",
    emoji: "🍭",
    vars: {
      "--bg-start": "350 100% 98%",
      "--bg-end": "280 40% 96%",
      "--brand": "340 75% 75%",
      "--brand-fg": "0 0% 100%",
      "--accent": "280 60% 85%",
      "--accent-fg": "280 30% 25%",
      "--card": "0 0% 100%",
      "--text": "340 15% 25%",
      "--muted": "340 10% 45%",
      "--ring": "340 75% 85%"
    }
  },
  {
    name: "Matcha",
    emoji: "🍵",
    vars: {
      "--bg-start": "120 40% 96%",
      "--bg-end": "160 40% 94%",
      "--brand": "150 60% 65%",
      "--brand-fg": "0 0% 100%",
      "--accent": "120 50% 75%",
      "--accent-fg": "120 30% 20%",
      "--card": "120 20% 99%",
      "--text": "160 30% 20%",
      "--muted": "160 15% 40%",
      "--ring": "150 60% 80%"
    }
  },
  {
    name: "Sunset",
    emoji: "🌅",
    vars: {
      "--bg-start": "25 90% 95%",
      "--bg-end": "10 85% 92%",
      "--brand": "15 85% 70%",
      "--brand-fg": "0 0% 100%",
      "--accent": "35 80% 75%",
      "--accent-fg": "35 30% 25%",
      "--card": "25 40% 98%",
      "--text": "25 30% 25%",
      "--muted": "25 15% 45%",
      "--ring": "15 85% 85%"
    }
  },
  {
    name: "Ocean",
    emoji: "🌊",
    vars: {
      "--bg-start": "200 80% 96%",
      "--bg-end": "220 60% 94%",
      "--brand": "210 70% 70%",
      "--brand-fg": "0 0% 100%",
      "--accent": "195 65% 75%",
      "--accent-fg": "195 30% 25%",
      "--card": "210 30% 99%",
      "--text": "220 30% 25%",
      "--muted": "220 15% 45%",
      "--ring": "210 70% 85%"
    }
  },
  {
    name: "Lavender",
    emoji: "💜",
    vars: {
      "--bg-start": "280 60% 96%",
      "--bg-end": "300 50% 94%",
      "--brand": "290 65% 70%",
      "--brand-fg": "0 0% 100%",
      "--accent": "270 55% 75%",
      "--accent-fg": "270 30% 25%",
      "--card": "285 20% 99%",
      "--text": "300 25% 25%",
      "--muted": "300 15% 45%",
      "--ring": "290 65% 85%"
    }
  },
  {
    name: "Midnight",
    emoji: "🌙",
    vars: {
      "--bg-start": "220 25% 15%",
      "--bg-end": "240 30% 10%",
      "--brand": "260 70% 60%",
      "--brand-fg": "0 0% 100%",
      "--accent": "200 60% 50%",
      "--accent-fg": "0 0% 100%",
      "--card": "225 20% 20%",
      "--text": "210 20% 85%",
      "--muted": "210 15% 65%",
      "--ring": "260 70% 75%"
    }
  }
];

function hslToHex(hslString: string): string {
  // Handle undefined/null values
  if (!hslString || typeof hslString !== 'string') {
    return '#000000'; // fallback to black
  }
  
  const [h, s, l] = hslString.split(' ').map(v => parseFloat(v.replace('%', '')));
  
  // Handle invalid parsing
  if (isNaN(h) || isNaN(s) || isNaN(l)) {
    return '#000000'; // fallback to black
  }
  
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));

  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function calculateContrast(text: string, bg: string): number {
  const getLuminance = (hslString: string): number => {
    const [, , l] = hslString.split(' ').map(v => parseFloat(v.replace('%', '')));
    return l / 100;
  };

  const textLum = getLuminance(text);
  const bgLum = getLuminance(bg);
  const lighter = Math.max(textLum, bgLum);
  const darker = Math.min(textLum, bgLum);
  
  return (lighter + 0.05) / (darker + 0.05);
}

export default function Theme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeData>(DEFAULT_THEME);
  const [tempTheme, setTempTheme] = useState<ThemeData>(DEFAULT_THEME);
  const [heroState, setHeroState] = useState<HeroState>(loadHero());
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const { toast } = useToast();

  // Load saved theme
  useEffect(() => {
    const saved = safeGet<ThemeData>('fm_theme_v1', DEFAULT_THEME);
    // Merge with defaults to ensure all required properties exist
    const mergedTheme = {
      ...DEFAULT_THEME,
      ...saved,
      vars: {
        ...DEFAULT_THEME.vars,
        ...saved.vars
      }
    };
    setCurrentTheme(mergedTheme);
    setTempTheme(mergedTheme);
    applyTheme(mergedTheme);
    setHeroState(loadHero());
    setYoutubeUrl(loadHero().youtubeUrl || "");
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fm_theme_v1') {
        const saved = safeGet<ThemeData>('fm_theme_v1', DEFAULT_THEME);
        // Merge with defaults to ensure all required properties exist
        const mergedTheme = {
          ...DEFAULT_THEME,
          ...saved,
          vars: {
            ...DEFAULT_THEME.vars,
            ...saved.vars
          }
        };
        setCurrentTheme(mergedTheme);
        setTempTheme(mergedTheme);
        applyTheme(mergedTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const applyTheme = (theme: ThemeData) => {
    const root = document.documentElement;
    
    // Apply all theme variables
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Also update the main CSS system variables to match theme
    root.style.setProperty('--primary', theme.vars['--brand']);
    root.style.setProperty('--primary-foreground', theme.vars['--brand-fg']);
    root.style.setProperty('--secondary', theme.vars['--accent']);
    root.style.setProperty('--secondary-foreground', theme.vars['--accent-fg']);
    root.style.setProperty('--background', theme.vars['--bg-start']);
    root.style.setProperty('--foreground', theme.vars['--text']);
    root.style.setProperty('--muted-foreground', theme.vars['--muted']);

    if (theme.useImage && theme.backgroundImage) {
      document.body.style.backgroundImage = `url(${theme.backgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundPosition = '';
    }
  };

  const updateTempVar = (key: string, value: string) => {
    const newTheme = {
      ...tempTheme,
      vars: { ...tempTheme.vars, [key]: hexToHsl(value) }
    };
    
    // Auto-calculate foreground colors for better contrast
    if (key === "--brand") {
      newTheme.vars["--brand-fg"] = "0 0% 100%"; // White text on brand
    } else if (key === "--accent") {
      // Calculate if we need dark or light text
      const [, , l] = hexToHsl(value).split(' ').map(v => parseFloat(v.replace('%', '')));
      newTheme.vars["--accent-fg"] = l > 50 ? "0 0% 20%" : "0 0% 100%";
    }
    
    setTempTheme(newTheme);
    applyTheme(newTheme);
  };

  const applyPreset = (preset: any) => {
    const newTheme = {
      ...tempTheme,
      vars: preset.vars
    };
    setTempTheme(newTheme);
    applyTheme(newTheme);
  };

  const saveTheme = () => {
    setCurrentTheme(tempTheme);
    safeSet('fm_theme_v1', tempTheme);
    toast({
      title: "🎨 Theme saved!",
      description: "Your custom theme has been applied."
    });
  };

  const resetTheme = () => {
    setTempTheme(DEFAULT_THEME);
    setCurrentTheme(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
    safeSet('fm_theme_v1', DEFAULT_THEME);
    toast({
      title: "🔄 Theme reset",
      description: "Restored to default kawaii theme."
    });
  };

  const contrast = calculateContrast(tempTheme.vars["--text"], tempTheme.vars["--card"]);
  const contrastGood = contrast >= 4.5;

  return (
    <ToolShell title="Theme Settings">
      <div className="space-y-8">
        {/* Live Preview */}
        <Card className="border-2 border-dashed border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl card-surface border" style={{ 
              background: `linear-gradient(135deg, hsl(${tempTheme.vars["--bg-start"]}) 0%, hsl(${tempTheme.vars["--bg-end"]}) 100%)` 
            }}>
              <div className="card-surface rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-main mb-2">Sample Card</h3>
                <p className="text-main/80 mb-3">This is how your theme will look across the app.</p>
                <div className="flex gap-2">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={contrastGood ? "default" : "destructive"}>
                Contrast: {contrast.toFixed(1)}:1 {contrastGood ? "✓ Good" : "⚠ Low"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="colors">Custom Colors</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {THEME_PRESETS.map((preset) => (
                <Card 
                  key={preset.name}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => applyPreset(preset)}
                >
                  <CardContent className="p-4">
                    <div 
                      className="h-16 rounded-lg mb-3"
                      style={{ 
                        background: `linear-gradient(135deg, hsl(${preset.vars["--bg-start"]}) 0%, hsl(${preset.vars["--bg-end"]}) 100%)` 
                      }}
                    />
                    <div className="text-center">
                      <div className="text-lg mb-1">{preset.emoji}</div>
                      <div className="font-medium text-sm">{preset.name}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bg-start">Background Start</Label>
                  <Input
                    id="bg-start"
                    type="color"
                    value={hslToHex(tempTheme.vars["--bg-start"])}
                    onChange={(e) => updateTempVar("--bg-start", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="bg-end">Background End</Label>
                  <Input
                    id="bg-end"
                    type="color"
                    value={hslToHex(tempTheme.vars["--bg-end"])}
                    onChange={(e) => updateTempVar("--bg-end", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand Color</Label>
                  <Input
                    id="brand"
                    type="color"
                    value={hslToHex(tempTheme.vars["--brand"])}
                    onChange={(e) => updateTempVar("--brand", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="accent">Accent Color</Label>
                  <Input
                    id="accent"
                    type="color"
                    value={hslToHex(tempTheme.vars["--accent"])}
                    onChange={(e) => updateTempVar("--accent", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="muted">Secondary Text</Label>
                  <Input
                    id="muted"
                    type="color"
                    value={hslToHex(tempTheme.vars["--muted"])}
                    onChange={(e) => updateTempVar("--muted", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card">Card Background</Label>
                  <Input
                    id="card"
                    type="color"
                    value={hslToHex(tempTheme.vars["--card"])}
                    onChange={(e) => updateTempVar("--card", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="text">Text Color</Label>
                  <Input
                    id="text"
                    type="color"
                    value={hslToHex(tempTheme.vars["--text"])}
                    onChange={(e) => updateTempVar("--text", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="ring">Focus Ring</Label>
                  <Input
                    id="ring"
                    type="color"
                    value={hslToHex(tempTheme.vars["--ring"])}
                    onChange={(e) => updateTempVar("--ring", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="background" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-image"
                  checked={tempTheme.useImage || false}
                  onCheckedChange={(checked) => {
                    const newTheme = { ...tempTheme, useImage: checked };
                    setTempTheme(newTheme);
                    applyTheme(newTheme);
                  }}
                />
                <Label htmlFor="use-image">Use background image</Label>
              </div>

              {tempTheme.useImage && (
                <div>
                  <Label htmlFor="bg-image">Background Image URL</Label>
                  <Input
                    id="bg-image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={tempTheme.backgroundImage || ""}
                    onChange={(e) => {
                      const newTheme = { ...tempTheme, backgroundImage: e.target.value };
                      setTempTheme(newTheme);
                      applyTheme(newTheme);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tip: Use high-quality images for best results
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="hero" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-main mb-4">🖼️ Hero Display</h3>
                <p className="text-muted mb-4">Choose what appears as the main hero image on your office page.</p>
                
                <div className="space-y-4">
                  {/* Hero Type Selection */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        const newState = { ...heroState, kind: "image" as const };
                        setHeroState(newState);
                        saveHero(newState);
                      }}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        heroState.kind === "image" || !heroState.kind
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">🖼️</div>
                      <div className="font-medium">Office Image</div>
                      <div className="text-sm text-muted-foreground">Static office photos</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        const newState = { ...heroState, kind: "youtube" as const };
                        setHeroState(newState);
                        saveHero(newState);
                      }}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        heroState.kind === "youtube"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">📺</div>
                      <div className="font-medium">YouTube Video</div>
                      <div className="text-sm text-muted-foreground">Ambient videos</div>
                    </button>
                  </div>

                  {/* Image Selection */}
                  {(heroState.kind === "image" || !heroState.kind) && (
                    <div className="space-y-3">
                      <Label>Choose Office Image</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {OFFICE_IMAGES.map((image) => (
                          <button
                            key={image.id}
                            onClick={() => {
                              const newState = { ...heroState, kind: "image" as const, imageSrc: image.src };
                              setHeroState(newState);
                              saveHero(newState);
                              toast({ title: `🏢 Office updated to ${image.name}` });
                            }}
                            className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                              heroState.imageSrc === image.src
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="aspect-video bg-muted rounded-lg mb-2 overflow-hidden">
                              <img 
                                src={image.src} 
                                alt={image.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">Image not found</div>';
                                }}
                              />
                            </div>
                            <div className="text-sm font-medium">{image.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* YouTube URL Input */}
                  {heroState.kind === "youtube" && (
                    <div className="space-y-3">
                      <Label htmlFor="youtube-url">YouTube Video URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="youtube-url"
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => {
                            if (youtubeUrl && youtubeUrl.includes("youtu")) {
                              const newState = { ...heroState, kind: "youtube" as const, youtubeUrl };
                              setHeroState(newState);
                              saveHero(newState);
                              toast({ title: "📺 YouTube video updated!" });
                            } else {
                              toast({ 
                                title: "❌ Invalid URL", 
                                description: "Please enter a valid YouTube URL",
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={!youtubeUrl || !youtubeUrl.includes("youtu")}
                          className="btn btn-primary"
                        >
                          Save
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        💡 Tip: Try ambient office videos, lofi music, or nature sounds for a calming atmosphere
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={saveTheme} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Theme
          </Button>
          <Button variant="outline" onClick={resetTheme}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          🎨 Your theme changes are applied instantly and saved across all tabs
        </div>
      </div>
    </ToolShell>
  );
}