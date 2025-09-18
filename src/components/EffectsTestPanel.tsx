import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCelebrationSystem } from '@/hooks/useCelebrationSystem';
import { useCelebration } from '@/hooks/useCelebration';
import { audioSystem } from '@/lib/audioSystem';
import { getCelebrationSettings } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export function EffectsTestPanel() {
  const { 
    celebrateTaskCompletion, 
    celebratePomodoroCompletion, 
    celebrateMicroWin 
  } = useCelebrationSystem();
  
  const { celebrateTask, celebratePomodoro } = useCelebration();
  const { toast } = useToast();

  const testConfetti = () => {
    celebrateTaskCompletion('big-three');
    toast({
      title: "🎊 Confetti Test",
      description: "Testing confetti animation and sounds"
    });
  };

  const testSound = async () => {
    try {
      await audioSystem.playSound('celebration', { respectSettings: false });
      toast({
        title: "🔊 Sound Test",
        description: "Playing celebration sound"
      });
    } catch (error) {
      toast({
        title: "❌ Sound Failed",
        description: "Could not play sound: " + error,
        variant: "destructive"
      });
    }
  };

  const testPopup = () => {
    celebrateTask('unicorn');
    toast({
      title: "🎉 Popup Test", 
      description: "Testing celebration popup"
    });
  };

  const testPetAnimation = () => {
    celebratePomodoro('dragon');
    toast({
      title: "🐉 Pet Animation Test",
      description: "Testing pet-themed celebration"
    });
  };

  const testMicroWin = () => {
    celebrateMicroWin("Test micro win!");
    toast({
      title: "⭐ Micro Win Test",
      description: "Testing micro win celebration"
    });
  };

  const checkSettings = () => {
    const settings = getCelebrationSettings();
    toast({
      title: "⚙️ Current Settings",
      description: `Enabled: ${settings.enabled}, Sound: ${settings.soundEnabled}, Popups: ${settings.popupsEnabled}`,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Effects Testing Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={testConfetti} variant="outline">
            Test Confetti
          </Button>
          <Button onClick={testSound} variant="outline">
            Test Sound
          </Button>
          <Button onClick={testPopup} variant="outline">
            Test Popup
          </Button>
          <Button onClick={testPetAnimation} variant="outline">
            Test Pet Animation
          </Button>
          <Button onClick={testMicroWin} variant="outline">
            Test Micro Win
          </Button>
          <Button onClick={checkSettings} variant="outline">
            Check Settings
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground p-3 bg-secondary rounded-lg">
          <p className="font-medium mb-2">Testing Instructions:</p>
          <ul className="space-y-1 text-xs">
            <li>• Change settings in Effects tab, then test here</li>
            <li>• Confetti should show visual animations</li>
            <li>• Sound should play celebration chimes</li>
            <li>• Popup should show celebration messages</li>
            <li>• Pet animations should use your selected pet</li>
            <li>• Quiet mode should suppress popups but keep tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}