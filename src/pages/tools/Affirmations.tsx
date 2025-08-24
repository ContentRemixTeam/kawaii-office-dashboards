import ToolShell from "@/components/ToolShell";

export default function Affirmations() {
  return (
    <ToolShell title="Affirmation Cards">
      <div className="space-y-6">
        <div className="bg-gradient-peach rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-accent-foreground mb-3">🃏 Daily Inspiration</h2>
          <p className="text-accent-foreground/80">
            Draw a beautiful affirmation card each day to set positive intentions and remind yourself of your inner strength and worth.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🌸 Daily Draw</h3>
            <p className="text-muted-foreground text-sm">Pull your daily affirmation card</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">📚 Card Collection</h3>
            <p className="text-muted-foreground text-sm">Browse all affirmation cards</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}