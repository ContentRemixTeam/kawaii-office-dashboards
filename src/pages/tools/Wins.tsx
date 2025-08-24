import ToolShell from "@/components/ToolShell";

export default function Wins() {
  return (
    <ToolShell title="Daily Wins Feed">
      <div className="space-y-6">
        <div className="bg-gradient-kawaii rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-primary-foreground mb-3">🏆 Celebrate Your Wins</h2>
          <p className="text-primary-foreground/90">
            End each day by capturing what went well. Build a beautiful collection of your achievements and proud moments!
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">✨ Daily Reflection</h3>
            <p className="text-muted-foreground text-sm">What went well today?</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">📚 Win Collection</h3>
            <p className="text-muted-foreground text-sm">Your trophy gallery</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}