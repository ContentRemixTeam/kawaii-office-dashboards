import { ReactNode } from "react";

export default function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_360px] gap-6">
      {children}
    </div>
  );
}