import { Card } from "@/components/ui/card";
import { useUISettings } from "@/hooks/useUISettings";
import DailyProgressPanel from "@/components/DailyProgressPanel";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import InspirationCorner from "@/components/InspirationCorner";

export function SidebarGroup() {
  const ui = useUISettings();
  
  if (ui.minimalMode) return null;
  
  const shouldShow = ui.showDailyProgress || ui.showQuickActions || ui.showInspiration;
  if (!shouldShow) return null;

  return (
    <div className="space-y-6">
      {ui.showDailyProgress && (
        <Card className="p-4 md:p-5">
          <DailyProgressPanel />
        </Card>
      )}
      
      {ui.showQuickActions && (
        <Card className="p-4 md:p-5">
          <QuickActionsPanel />
        </Card>
      )}
      
      {ui.showInspiration && (
        <Card className="p-4 md:p-5">
          <InspirationCorner />
        </Card>
      )}
    </div>
  );
}