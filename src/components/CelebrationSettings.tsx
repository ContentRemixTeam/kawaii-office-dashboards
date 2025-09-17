import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Sparkles, Zap, Settings } from 'lucide-react';
import { getCelebrationSettings, setCelebrationSettings, type CelebrationSettings } from '@/lib/storage';
import { audioSystem } from '@/lib/audioSystem';
import { useState, useEffect } from 'react';

export function CelebrationSettings() {
  const [settings, setSettings] = useState<CelebrationSettings>(getCelebrationSettings());

  useEffect(() => {
    setSettings(getCelebrationSettings());
  }, []);

  const updateSetting = (key: keyof CelebrationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setCelebrationSettings({ [key]: value });
  };

  const testSound = async () => {
    try {
      await audioSystem.playSound('celebration', { respectSettings: false });
    } catch (error) {
      console.warn('Test sound failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Celebration Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Enable Celebrations</Label>
            <p className="text-sm text-muted-foreground">
              Master switch for all celebration features
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSetting('enabled', checked)}
          />
        </div>

        {/* Sound Settings */}
        <div className="space-y-4 opacity-100 transition-opacity" style={{ opacity: settings.enabled ? 1 : 0.5 }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Sound Effects
              </Label>
              <p className="text-sm text-muted-foreground">
                Play celebration sounds when completing tasks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                disabled={!settings.enabled}
              />
              {settings.soundEnabled && (
                <Button size="sm" variant="outline" onClick={testSound}>
                  Test
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Visual Settings */}
        <div className="space-y-4 opacity-100 transition-opacity" style={{ opacity: settings.enabled ? 1 : 0.5 }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Celebration Popups
              </Label>
              <p className="text-sm text-muted-foreground">
                Show confetti and celebration messages
              </p>
            </div>
            <Switch
              checked={settings.popupsEnabled}
              onCheckedChange={(checked) => updateSetting('popupsEnabled', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Minimal Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Reduce animations and effects for better performance
              </p>
            </div>
            <Switch
              checked={settings.minimalMode}
              onCheckedChange={(checked) => updateSetting('minimalMode', checked)}
              disabled={!settings.enabled}
            />
          </div>
        </div>

        {/* Throttle Settings */}
        <div className="space-y-4 opacity-100 transition-opacity" style={{ opacity: settings.enabled ? 1 : 0.5 }}>
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Celebration Cooldown: {settings.throttleSeconds}s
            </Label>
            <p className="text-sm text-muted-foreground">
              Minimum time between celebrations to prevent spam
            </p>
            <Slider
              value={[settings.throttleSeconds]}
              onValueChange={(value) => updateSetting('throttleSeconds', value[0])}
              min={1}
              max={30}
              step={1}
              className="w-full"
              disabled={!settings.enabled}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-4 border-t">
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
              setSettings(newSettings);
              setCelebrationSettings(newSettings);
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
                popupsEnabled: true,
                throttleSeconds: 10,
                minimalMode: true,
                forcePetTheme: true
              };
              setSettings(newSettings);
              setCelebrationSettings(newSettings);
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
              setSettings(newSettings);
              setCelebrationSettings(newSettings);
            }}
          >
            Disable All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}