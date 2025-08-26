import { ReactNode } from "react";

export default function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        grid gap-6
        grid-cols-1
        md:grid-cols-6
        xl:grid-cols-12
        [grid-auto-flow:dense]
        auto-rows-[8rem]
      "
    >
      {children}
    </div>
  );
}