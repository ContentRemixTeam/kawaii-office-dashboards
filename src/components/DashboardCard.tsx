import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type Size = 's' | 'm' | 'l';

const sizeToRowSpan: Record<Size, string> = {
  s: 'row-span-1',
  m: 'row-span-2',
  l: 'row-span-3',
};

export function DashboardCard({
  size = 'm',
  colSpan = { base: 1, md: 3, xl: 4 },
  className = '',
  children,
}: {
  size?: Size;
  colSpan?: { base?: number; md?: number; xl?: number };
  className?: string;
  children: ReactNode;
}) {
  const spanBase = `col-span-${colSpan.base ?? 1}`;
  const spanMd = `md:col-span-${colSpan.md ?? 3}`;
  const spanXl = `xl:col-span-${colSpan.xl ?? 4}`;
  const rowSpan = sizeToRowSpan[size];

  return (
    <Card className={[
      'p-4 md:p-5 w-full overflow-hidden',
      spanBase, spanMd, spanXl, rowSpan,
      className,
    ].join(' ')}>
      {children}
    </Card>
  );
}