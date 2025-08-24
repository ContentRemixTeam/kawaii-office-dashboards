import ToolShell from "@/components/ToolShell";

export default function Money() {
  return (
    <ToolShell title="Money Celebration Tracker">
      <div className="space-y-6">
        <div className="bg-gradient-kawaii rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-primary-foreground mb-3">🐷 Financial Joy</h2>
          <p className="text-primary-foreground/90">
            Celebrate every financial milestone, no matter how small! Track your money wins and watch your digital piggy bank grow with each achievement.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">💰 Savings Goals</h3>
            <p className="text-muted-foreground text-sm">Set and track your savings milestones</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/20">
            <h3 className="font-medium text-card-foreground mb-2">🎉 Money Wins</h3>
            <p className="text-muted-foreground text-sm">Celebrate financial achievements</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}