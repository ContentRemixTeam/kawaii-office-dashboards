import ToolShell from "@/components/ToolShell";

export default function Habits() {
  return (
    <ToolShell title="Habit Garden">
      <div className="space-y-6">
        <div className="bg-gradient-kawaii rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-primary-foreground mb-3">🌱 Growing Good Habits</h2>
          <p className="text-primary-foreground/90">
            Watch your habits bloom into beautiful plants! Each day you maintain a habit, your digital garden grows more vibrant and lush.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🌿 Plant Habits</h3>
            <p className="text-muted-foreground text-sm">Start new habit seeds</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">💧 Daily Watering</h3>
            <p className="text-muted-foreground text-sm">Check off completed habits</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🌸 Blooming Streaks</h3>
            <p className="text-muted-foreground text-sm">Celebrate long streaks</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}