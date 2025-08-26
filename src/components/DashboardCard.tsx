import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function DashboardCard({
  className = '',
  children,
  fullWidth = false,
}: {
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <Card className={`${fullWidth ? 'lg:col-span-2' : ''} ${className}`}>
      {children}
    </Card>
  );
}