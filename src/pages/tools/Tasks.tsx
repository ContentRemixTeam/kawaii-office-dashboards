import ToolShell from "@/components/ToolShell";

export default function Tasks() {
  return (
    <ToolShell title="Daily Task Pets + Intention">
      <div className="space-y-6">
        <div className="bg-gradient-mint rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-secondary-foreground mb-3">🐱 Your Task Pets</h2>
          <p className="text-secondary-foreground/80">
            Transform your daily tasks into adorable digital pets! Each task becomes a cute companion that grows and evolves as you complete your goals.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🌱 Daily Intention</h3>
            <p className="text-muted-foreground text-sm">Set your positive intention for the day</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">✨ Pet Care</h3>
            <p className="text-muted-foreground text-sm">Feed and nurture your task pets</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}