import ToolShell from "@/components/ToolShell";

export default function Breaks() {
  return (
    <ToolShell title="Mini Guided Breaks">
      <div className="space-y-6">
        <div className="bg-gradient-peach rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-accent-foreground mb-3">🧘‍♀️ Mindful Moments</h2>
          <p className="text-accent-foreground/80">
            Take gentle, guided micro-breaks to refresh your mind and body. Just 2-5 minutes can help you reset and return to your tasks with renewed energy.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🫁 Breathing Exercises</h3>
            <p className="text-muted-foreground text-sm">Quick breathing techniques</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🤸‍♀️ Gentle Stretches</h3>
            <p className="text-muted-foreground text-sm">Desk-friendly movement breaks</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}