import { useNavigate } from "react-router-dom";

export default function TopBarPetChip({ animal, stage }: { animal: string | null; stage: number }) {
  const navigate = useNavigate();
  
  const map: any = { 
    Unicorn: "🦄", Dragon: "🐉", Cat: "🐱", Dog: "🐶", 
    Bunny: "🐰", Fox: "🦊", Panda: "🐼", Penguin: "🐧", 
    Owl: "🦉", Hamster: "🐹" 
  };
  
  const emoji = map[animal ?? ""] ?? "🐾";
  const steps = [0, 1, 2, 3].map(i => (
    <span 
      key={i} 
      className={`h-2 w-2 rounded-full ${i <= stage ? "bg-primary" : "bg-muted"}`} 
    />
  ));
  
  return (
    <button
      onClick={() => navigate("/tools/tasks")}
      className="inline-flex items-center gap-2 rounded-2xl border bg-card/80 px-3 py-2 backdrop-blur shadow-sm hover:shadow-md transition-all"
    >
      <span className="text-lg">{emoji}</span>
      <span className="text-sm text-foreground">{animal ?? "Pick pet"}</span>
      <span className="flex items-center gap-1">{steps}</span>
    </button>
  );
}