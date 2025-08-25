import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Timer, Target, Sparkles, Music, BookOpen, Trophy, Coffee } from "lucide-react";

export default function QuickActionsPanel() {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Timer,
      label: "Start Focus",
      description: "Begin a Pomodoro session",
      onClick: () => navigate('/tools/focus'),
      gradient: "from-red-500/10 to-red-600/10",
      iconColor: "text-red-600"
    },
    {
      icon: Target,
      label: "Set Tasks",
      description: "Plan your Big Three",
      onClick: () => navigate('/tools/tasks'),
      gradient: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-600"
    },
    {
      icon: Sparkles,
      label: "Pick Word",
      description: "Choose power word",
      onClick: () => navigate('/tools/energy'),
      gradient: "from-purple-500/10 to-purple-600/10",
      iconColor: "text-purple-600"
    },
    {
      icon: Music,
      label: "Ambience",
      description: "Change soundscape",
      onClick: () => navigate('/tools/sounds'),
      gradient: "from-green-500/10 to-green-600/10",
      iconColor: "text-green-600"
    },
    {
      icon: BookOpen,
      label: "Vision",
      description: "View your goals",
      onClick: () => navigate('/tools/vision'),
      gradient: "from-orange-500/10 to-orange-600/10",
      iconColor: "text-orange-600"
    },
    {
      icon: Coffee,
      label: "Take a Break",
      description: "Mindful break room",
      onClick: () => navigate('/tools/break-room'),
      gradient: "from-teal-500/10 to-teal-600/10",
      iconColor: "text-teal-600"
    },
    {
      icon: Trophy,
      label: "Celebrate",
      description: "Log today's wins",
      onClick: () => navigate('/tools/wins'),
      gradient: "from-yellow-500/10 to-yellow-600/10",
      iconColor: "text-yellow-600"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start p-3 h-auto bg-gradient-to-r ${action.gradient} hover:scale-105 transition-all duration-200`}
              onClick={action.onClick}
            >
              <div className="flex items-center gap-3 w-full">
                <IconComponent className={`w-5 h-5 ${action.iconColor}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}