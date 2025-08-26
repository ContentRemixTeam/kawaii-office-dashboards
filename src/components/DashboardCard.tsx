import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm p-4 md:p-5",
      className
    )}>
      {children}
    </div>
  );
}