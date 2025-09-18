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
import { safeGet, safeSet, getCelebrationsEnabled, setCelebrationsEnabled, getEncouragementsEnabled, setEncouragementsEnabled, getHomeTitle, setHomeTitle, getHomeSubtitle, setHomeSubtitle, getGiphyCelebrationsEnabled, setGiphyCelebrationsEnabled, getCelebrationSettings, setCelebrationSettings, CelebrationSettings } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { EffectsTestPanel } from "@/components/EffectsTestPanel";
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
  hiddenFeatures?: {
    topBarEnergyWord?: boolean;
    topBarAffirmations?: boolean;
    topBarTaskPet?: boolean;
    topBarEarnedAnimals?: boolean;
    topBarTrophies?: boolean;
    homeVisionStrip?: boolean;
    homeTaskTools?: boolean;
    homeGameified?: boolean;
    homeCustomization?: boolean;
    dailyIntentionAuto?: boolean;
    debriefAuto?: boolean;
    celebrationModals?: boolean;
    pomodoroWinTracking?: boolean;
  };
}

const DEFAULT_THEME: ThemeData = {
  vars: {
    "--bg-start": "0 0% 100%",       // pure white
    "--bg-end": "210 100% 98%",      // very light blue
    "--brand": "220 30% 85%",        // light pastel blue
    "--brand-fg": "220 15% 25%",     // dark text on brand
    "--accent": "200 25% 88%",       // very light pastel blue-gray
    "--accent-fg": "200 15% 30%",    // dark text on accent
    "--card": "0 0% 100%",           // white
    "--text": "220 13% 18%",         // dark gray
    "--muted": "220 9% 55%",         // secondary text
    "--ring": "220 25% 80%"          // light pastel focus ring
  },
  hiddenFeatures: {
    topBarEnergyWord: false,
    topBarAffirmations: false,
    topBarTaskPet: false,
    topBarEarnedAnimals: false,
    topBarTrophies: false,
    homeVisionStrip: false,
    homeTaskTools: false,
    homeGameified: false,
    homeCustomization: false,
    dailyIntentionAuto: false,
    debriefAuto: false,
    celebrationModals: false,
    pomodoroWinTracking: false,
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
  const [celebrationsEnabledState, setCelebrationsEnabledState] = useState(getCelebrationsEnabled());
  const [encouragementsEnabledState, setEncouragementsEnabledState] = useState(getEncouragementsEnabled());
  const [giphyCelebrationsEnabledState, setGiphyCelebrationsEnabledState] = useState(getGiphyCelebrationsEnabled());
  const [celebrationSettings, setCelebrationSettingsState] = useState<CelebrationSettings>(getCelebrationSettings());
  const [homeTitleState, setHomeTitleState] = useState(getHomeTitle());
  const [homeSubtitleState, setHomeSubtitleState] = useState(getHomeSubtitle());
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
      },
      hiddenFeatures: {
        ...DEFAULT_THEME.hiddenFeatures,
        ...saved.hiddenFeatures
      }
    };
    setCurrentTheme(mergedTheme);
    setTempTheme(mergedTheme);
    applyTheme(mergedTheme);
    setHeroState(loadHero());
    setYoutubeUrl(loadHero().youtubeUrl || "");
    setCelebrationsEnabledState(getCelebrationsEnabled());
    setEncouragementsEnabledState(getEncouragementsEnabled());
    setGiphyCelebrationsEnabledState(getGiphyCelebrationsEnabled());
    setHomeTitleState(getHomeTitle());
    setHomeSubtitleState(getHomeSubtitle());
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
          },
          hiddenFeatures: {
            ...DEFAULT_THEME.hiddenFeatures,
            ...saved.hiddenFeatures
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Live Preview Section */}
        <Card className="card-standard border-2 border-dashed border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-card-title">
              <Palette className="w-5 h-5 text-primary" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-xl border-2 border-border/50" style={{ 
              background: `linear-gradient(135deg, hsl(${tempTheme.vars["--bg-start"]}) 0%, hsl(${tempTheme.vars["--bg-end"]}) 100%)` 
            }}>
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-foreground mb-2">Sample Card</h3>
                <p className="text-muted-foreground mb-4">This is how your theme will look across the app.</p>
                <div className="flex gap-3">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Primary Button</Button>
                  <Button variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Secondary</Button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={contrastGood ? "default" : "destructive"} className="px-3 py-1">
                Contrast: {contrast.toFixed(1)}:1 {contrastGood ? "✓ Good" : "⚠ Low"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Theme Customization Tabs */}
        <div className="space-y-4">
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-12 bg-background border border-border rounded-lg p-1">
              <TabsTrigger value="presets" className="text-sm font-medium">Presets</TabsTrigger>
              <TabsTrigger value="colors" className="text-sm font-medium">Colors</TabsTrigger>
              <TabsTrigger value="background" className="text-sm font-medium">Background</TabsTrigger>
              <TabsTrigger value="hero" className="text-sm font-medium">Hero</TabsTrigger>
              <TabsTrigger value="features" className="text-sm font-medium">Features</TabsTrigger>
              <TabsTrigger value="effects" className="text-sm font-medium">Effects</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="mt-6">
              <Card className="card-standard">
                <CardHeader className="pb-4">
                  <CardTitle className="text-card-title">Theme Presets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {THEME_PRESETS.map((preset) => (
                      <Card 
                        key={preset.name}
                        className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary/30"
                        onClick={() => applyPreset(preset)}
                      >
                        <CardContent className="p-4">
                          <div 
                            className="h-16 rounded-lg mb-3 border shadow-sm"
                            style={{ 
                              background: `linear-gradient(135deg, hsl(${preset.vars["--bg-start"]}) 0%, hsl(${preset.vars["--bg-end"]}) 100%)` 
                            }}
                          />
                          <div className="text-center">
                            <div className="text-xl mb-1">{preset.emoji}</div>
                            <div className="font-medium text-sm text-foreground">{preset.name}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="mt-6">
              <Card className="card-standard">
                <CardHeader className="pb-4">
                  <CardTitle className="text-card-title">Custom Colors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="bg-start" className="text-sm font-medium">Background Start</Label>
                        <Input
                          id="bg-start"
                          type="color"
                          value={hslToHex(tempTheme.vars["--bg-start"])}
                          onChange={(e) => updateTempVar("--bg-start", e.target.value)}
                          className="h-12 w-full cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bg-end" className="text-sm font-medium">Background End</Label>
                        <Input
                          id="bg-end"
                          type="color"
                          value={hslToHex(tempTheme.vars["--bg-end"])}
                          onChange={(e) => updateTempVar("--bg-end", e.target.value)}
                          className="h-12 w-full cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand" className="text-sm font-medium">Brand Color</Label>
                        <Input
                          id="brand"
                          type="color"
                          value={hslToHex(tempTheme.vars["--brand"])}
                          onChange={(e) => updateTempVar("--brand", e.target.value)}
                          className="h-12 w-full cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accent" className="text-sm font-medium">Accent Color</Label>
                        <Input
                          id="accent"
                          type="color"
                          value={hslToHex(tempTheme.vars["--accent"])}
                          onChange={(e) => updateTempVar("--accent", e.target.value)}
                          className="h-12 w-full cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="card" className="text-sm font-medium">Card Background</Label>
                        <Input
                          id="card"
                          type="color"
                          value={hslToHex(tempTheme.vars["--card"])}
                          onChange={(e) => updateTempVar("--card", e.target.value)}
                          className="h-12 w-full cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="text" className="text-sm font-medium">Text Color</Label>
                        <Input
                          id="text"
                          type="color"
                          value={hslToHex(tempTheme.vars["--text"])}
                          onChange={(e) => updateTempVar("--text", e.target.value)}
                          className="h-12 w-full cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="muted" className="text-sm font-medium">Secondary Text</Label>
                        <Input
                          id="muted"
                          type="color"
                          value={hslToHex(tempTheme.vars["--muted"])}
                          onChange={(e) => updateTempVar("--muted", e.target.value)}
                          className="h-12 w-full cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ring" className="text-sm font-medium">Focus Ring</Label>
                        <Input
                          id="ring"
                          type="color"
                          value={hslToHex(tempTheme.vars["--ring"])}
                          onChange={(e) => updateTempVar("--ring", e.target.value)}
                          className="h-12 w-full cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="background" className="mt-6">
              <Card className="card-standard">
                <CardHeader className="pb-4">
                  <CardTitle className="text-card-title">Background Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="use-image"
                      checked={tempTheme.useImage || false}
                      onCheckedChange={(checked) => {
                        const newTheme = { ...tempTheme, useImage: checked };
                        setTempTheme(newTheme);
                        applyTheme(newTheme);
                      }}
                    />
                    <Label htmlFor="use-image" className="text-sm font-medium">Use background image</Label>
                  </div>

                  {tempTheme.useImage && (
                    <div className="space-y-2">
                      <Label htmlFor="bg-image" className="text-sm font-medium">Background Image URL</Label>
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
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tip: Use high-quality images for best results
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hero" className="mt-6">
              <Card className="card-standard">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-card-title">
                    <span>🖼️</span>
                    Hero Display
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">Choose what appears as the main hero image on your office page.</p>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        >
                          Save
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        💡 Tip: Try ambient office videos, lofi music, or nature sounds for a calming atmosphere
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-main mb-2">🎛️ Feature Visibility</h3>
                <p className="text-muted mb-4">Customize which features appear in your app interface.</p>
              </div>

              <div className="space-y-6">
                {/* Top Bar Features */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    📍 Top Bar Elements
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-energy">⚡ Energy Word</Label>
                        <p className="text-xs text-muted-foreground">Show your daily power word</p>
                      </div>
                      <Switch
                        id="hide-energy"
                        checked={!tempTheme.hiddenFeatures?.topBarEnergyWord}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              topBarEnergyWord: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-affirmations">🃏 Affirmations</Label>
                        <p className="text-xs text-muted-foreground">Display your daily affirmation</p>
                      </div>
                      <Switch
                        id="hide-affirmations"
                        checked={!tempTheme.hiddenFeatures?.topBarAffirmations}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              topBarAffirmations: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-pet">🐾 Task Pet</Label>
                        <p className="text-xs text-muted-foreground">Show your task completion pet</p>
                      </div>
                      <Switch
                        id="hide-pet"
                        checked={!tempTheme.hiddenFeatures?.topBarTaskPet}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              topBarTaskPet: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-trophies">🏆 Trophy Counter</Label>
                        <p className="text-xs text-muted-foreground">Show your earned trophies count</p>
                      </div>
                      <Switch
                        id="hide-trophies"
                        checked={!tempTheme.hiddenFeatures?.topBarTrophies}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              topBarTrophies: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-earned">🏆 Earned Animals</Label>
                        <p className="text-xs text-muted-foreground">Display earned animal rewards</p>
                      </div>
                      <Switch
                        id="hide-earned"
                        checked={!tempTheme.hiddenFeatures?.topBarEarnedAnimals}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              topBarEarnedAnimals: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Homepage Features */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    🏠 Homepage Sections
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-vision">🌟 Vision Board Strip</Label>
                        <p className="text-xs text-muted-foreground">Show vision board preview</p>
                      </div>
                      <Switch
                        id="hide-vision"
                        checked={!tempTheme.hiddenFeatures?.homeVisionStrip}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              homeVisionStrip: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-daily">🌱 Daily Habits Section</Label>
                        <p className="text-xs text-muted-foreground">Tasks, Energy, Affirmations, Habits</p>
                      </div>
                      <Switch
                        id="hide-daily"
                        checked={!tempTheme.hiddenFeatures?.homeTaskTools}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              homeDailyHabits: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-gamified">🎮 Gamified Tools Section</Label>
                        <p className="text-xs text-muted-foreground">Pomodoro, Wins, Money, Cabinet</p>
                      </div>
                      <Switch
                        id="hide-gamified"
                        checked={!tempTheme.hiddenFeatures?.homeGameified}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              homeGameified: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-custom">✨ Customization Section</Label>
                        <p className="text-xs text-muted-foreground">Sounds, Theme, Vision Board</p>
                      </div>
                      <Switch
                        id="hide-custom"
                        checked={!tempTheme.hiddenFeatures?.homeCustomization}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              homeCustomization: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Automation Features */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    🤖 Automation & Notifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-intention">🎯 Daily Intention Auto-Show</Label>
                        <p className="text-xs text-muted-foreground">Automatically show intention modal</p>
                      </div>
                      <Switch
                        id="hide-intention"
                        checked={!tempTheme.hiddenFeatures?.dailyIntentionAuto}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              dailyIntentionAuto: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-debrief">📝 Daily Debrief Auto-Show</Label>
                        <p className="text-xs text-muted-foreground">Automatically show debrief modal</p>
                      </div>
                      <Switch
                        id="hide-debrief"
                        checked={!tempTheme.hiddenFeatures?.debriefAuto}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              debriefAuto: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-celebrations">🎉 Celebration Modals</Label>
                        <p className="text-xs text-muted-foreground">Show achievement celebrations</p>
                      </div>
                      <Switch
                        id="hide-celebrations"
                        checked={!tempTheme.hiddenFeatures?.celebrationModals}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              celebrationModals: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-pomodoro">⏱️ Pomodoro Win Tracking</Label>
                        <p className="text-xs text-muted-foreground">Track and celebrate pomodoro sessions</p>
                      </div>
                      <Switch
                        id="hide-pomodoro"
                        checked={!tempTheme.hiddenFeatures?.pomodoroWinTracking}
                        onCheckedChange={(checked) => {
                          const newTheme = {
                            ...tempTheme,
                            hiddenFeatures: {
                              ...tempTheme.hiddenFeatures,
                              pomodoroWinTracking: !checked
                            }
                          };
                          setTempTheme(newTheme);
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="effects" className="mt-6">
            <Card className="card-standard">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-card-title">
                  <span>✨</span>
                  Animation Effects
                </CardTitle>
                <p className="text-muted-foreground text-sm">Configure celebration animations and visual effects</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Section 1: Celebrations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-card-title">🎉 Celebrations</h3>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="space-y-1">
                      <Label htmlFor="show-confetti-toggle" className="text-sm font-medium">
                        Show Confetti
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Add colorful animations when you complete tasks
                      </p>
                    </div>
                    <Switch
                      id="show-confetti-toggle"
                      checked={celebrationSettings.enabled && celebrationSettings.popupsEnabled}
                      onCheckedChange={(checked) => {
                        const updated = { 
                          ...celebrationSettings, 
                          enabled: checked,
                          popupsEnabled: checked
                        };
                        setCelebrationSettingsState(updated);
                        setCelebrationSettings(updated);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="space-y-1">
                      <Label htmlFor="play-sounds-toggle" className="text-sm font-medium">
                        Play Sounds
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Hear satisfying chimes when you finish something
                      </p>
                    </div>
                    <Switch
                      id="play-sounds-toggle"
                      checked={celebrationSettings.soundEnabled}
                      onCheckedChange={(checked) => {
                        const updated = { ...celebrationSettings, soundEnabled: checked };
                        setCelebrationSettingsState(updated);
                        setCelebrationSettings({ soundEnabled: checked });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="space-y-1">
                      <Label htmlFor="show-popups-toggle" className="text-sm font-medium">
                        Show Popups
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get celebration messages for completed tasks
                      </p>
                    </div>
                    <Switch
                      id="show-popups-toggle"
                      checked={celebrationSettings.enabled}
                      onCheckedChange={(checked) => {
                        const updated = { ...celebrationSettings, enabled: checked };
                        setCelebrationSettingsState(updated);
                        setCelebrationSettings({ enabled: checked });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="space-y-1">
                      <Label htmlFor="motivational-notes-toggle" className="text-sm font-medium">
                        Motivational Notes
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        See encouraging messages during celebrations
                      </p>
                    </div>
                    <Switch
                      id="motivational-notes-toggle"
                      checked={encouragementsEnabledState}
                      onCheckedChange={(checked) => {
                        setEncouragementsEnabledState(checked);
                        setEncouragementsEnabled(checked);
                      }}
                    />
                  </div>
                </div>
                
                {/* Section 2: Personalization */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-card-title">🎨 Personalization</h3>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="space-y-1">
                      <Label htmlFor="pet-animations-toggle" className="text-sm font-medium">
                        Use Pet Animations
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Show celebrations that match your chosen pet
                      </p>
                    </div>
                    <Switch
                      id="pet-animations-toggle"
                      checked={celebrationSettings.forcePetTheme}
                      onCheckedChange={(checked) => {
                        const updated = { ...celebrationSettings, forcePetTheme: checked };
                        setCelebrationSettingsState(updated);
                        setCelebrationSettings({ forcePetTheme: checked });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="space-y-1">
                      <Label htmlFor="quiet-mode-toggle" className="text-sm font-medium">
                        Quiet Mode
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Turn off popups but keep tracking your progress
                      </p>
                    </div>
                    <Switch
                      id="quiet-mode-toggle"
                      checked={celebrationSettings.minimalMode}
                      onCheckedChange={(checked) => {
                        const updated = { 
                          ...celebrationSettings, 
                          minimalMode: checked,
                          popupsEnabled: !checked // Quiet mode disables popups
                        };
                        setCelebrationSettingsState(updated);
                        setCelebrationSettings(updated);
                      }}
                    />
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSettings = {
                        enabled: true,
                        soundEnabled: true,
                        popupsEnabled: true,
                        throttleSeconds: 5,
                        minimalMode: false,
                        forcePetTheme: true
                      };
                      setCelebrationSettingsState(newSettings);
                      setCelebrationSettings(newSettings);
                      setEncouragementsEnabledState(true);
                      setEncouragementsEnabled(true);
                      toast({
                        title: "✨ All effects enabled",
                        description: "Full celebration experience activated!"
                      });
                    }}
                  >
                    Enable All
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSettings = {
                        enabled: true,
                        soundEnabled: false,
                        popupsEnabled: false,
                        throttleSeconds: 10,
                        minimalMode: true,
                        forcePetTheme: true
                      };
                      setCelebrationSettingsState(newSettings);
                      setCelebrationSettings(newSettings);
                      setEncouragementsEnabledState(false);
                      setEncouragementsEnabled(false);
                      toast({
                        title: "🔇 Quiet mode enabled",
                        description: "Tracking continues without distractions"
                      });
                    }}
                  >
                    Quiet Mode
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSettings = {
                        enabled: false,
                        soundEnabled: false,
                        popupsEnabled: false,
                        throttleSeconds: 10,
                        minimalMode: true,
                        forcePetTheme: false
                      };
                      setCelebrationSettingsState(newSettings);
                      setCelebrationSettings(newSettings);
                      setEncouragementsEnabledState(false);
                      setEncouragementsEnabled(false);
                      toast({
                        title: "🚫 All effects disabled",
                        description: "Clean, minimal experience"
                      });
                    }}
                  >
                    Disable All
                  </Button>
                </div>
                
              </CardContent>
            </Card>
            
            {/* Testing Panel for Effects */}
            <div className="mt-6">
              <EffectsTestPanel />
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <Card className="card-standard">
          <CardContent className="pt-6">
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
            <div className="text-center text-sm text-muted-foreground mt-4">
              🎨 Your theme changes are applied instantly and saved across all tabs
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </ToolShell>
  );
}