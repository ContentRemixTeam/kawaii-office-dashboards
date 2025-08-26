import { ReactNode } from "react";

export default function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {children}
      </div>
    </div>
  );
}