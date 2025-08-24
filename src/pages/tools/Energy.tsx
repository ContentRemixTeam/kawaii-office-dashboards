import ToolShell from "@/components/ToolShell";

export default function Energy() {
  return (
    <ToolShell title="Energy Word Selector">
      <div className="space-y-6">
        <div className="bg-gradient-mint rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-secondary-foreground mb-3">⚡ Daily Energy Word</h2>
          <p className="text-secondary-foreground/80">
            Choose a powerful word that embodies the energy you want to carry throughout your day. Let it guide your actions and mindset.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🌟 Inspiring</h3>
            <p className="text-muted-foreground text-sm">Words that motivate and uplift</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🧘 Calming</h3>
            <p className="text-muted-foreground text-sm">Words that bring peace</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">💪 Empowering</h3>
            <p className="text-muted-foreground text-sm">Words that build confidence</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}