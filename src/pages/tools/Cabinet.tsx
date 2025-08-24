import ToolShell from "@/components/ToolShell";

export default function Cabinet() {
  return (
    <ToolShell title="Positivity Filing Cabinet">
      <div className="space-y-6">
        <div className="bg-gradient-peach rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-accent-foreground mb-3">📁 Store Your Treasures</h2>
          <p className="text-accent-foreground/80">
            A beautiful digital filing system for all your positive memories, testimonials, kind words, and achievements. Never lose sight of how amazing you are!
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">💌 Kind Words</h3>
            <p className="text-muted-foreground text-sm">Compliments and encouragement</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🏆 Achievements</h3>
            <p className="text-muted-foreground text-sm">Your wins and milestones</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">📝 Testimonials</h3>
            <p className="text-muted-foreground text-sm">Feedback and reviews</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}