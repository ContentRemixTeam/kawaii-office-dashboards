import React from "react";
import { writeTodayDebrief } from "@/lib/dailyFlow";
import { emitChanged } from "@/lib/bus";
import { clearEarnedAnimals } from "@/lib/topbarState";
import DailySummary from "@/components/DailySummary";

export default function DebriefModal({ open, onClose }:{ open:boolean; onClose:()=>void; }){
  const [w1,setW1]=React.useState("");
  const [w2,setW2]=React.useState("");
  const [w3,setW3]=React.useState("");
  const [reflect,setReflect]=React.useState("");
  const [n1,setN1]=React.useState("");
  const [n2,setN2]=React.useState("");
  const [n3,setN3]=React.useState("");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-card shadow-xl border">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">🌙 Daily Debrief</h2>
          <p className="text-sm text-muted-foreground">Close the loop and set tomorrow up for success.</p>
        </div>
        <div className="p-5 space-y-4">
          {/* Daily Summary */}
          <DailySummary />
          
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Wins (up to 3)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                value={w1} 
                onChange={e=>setW1(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Shipped landing page" 
              />
              <input 
                value={w2} 
                onChange={e=>setW2(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Closed client" 
              />
              <input 
                value={w3} 
                onChange={e=>setW3(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Stayed focused" 
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Reflection</label>
            <textarea 
              value={reflect} 
              onChange={e=>setReflect(e.target.value)} 
              rows={3} 
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              placeholder="What worked? What needs adjustment?" 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Top 3 for tomorrow (optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                value={n1} 
                onChange={e=>setN1(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
              <input 
                value={n2} 
                onChange={e=>setN2(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
              <input 
                value={n3} 
                onChange={e=>setN3(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-border flex items-center justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Later
          </button>
          <button
            onClick={()=>{
              const wins=[w1,w2,w3].filter(Boolean);
              const nextTop3=[n1,n2,n3].filter(Boolean);
              writeTodayDebrief({ wins, reflect, nextTop3 });
              clearEarnedAnimals(); // Clear earned animals on sign-off
              emitChanged(["fm_daily_debrief_v1"]);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save & sign off
          </button>
        </div>
      </div>
    </div>
  );
}