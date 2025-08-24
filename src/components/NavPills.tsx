import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "@/data/nav";

export default function NavPills() {
  const { pathname } = useLocation();
  
  return (
    <nav aria-label="Tool navigation" className="w-full">
      <ul className="flex flex-wrap justify-center gap-2">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                aria-current={active ? "page" : undefined}
                className={`
                  inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold
                  border-2 shadow-lg transition-all duration-200 
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
                  hover:scale-110 hover:shadow-xl transform
                  min-h-[44px]
                  ${active
                    ? "bg-gradient-primary border-primary text-white shadow-primary/30 scale-105"
                    : "bg-white/90 hover:bg-white border-border/40 text-main hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                  }
                `.trim()}
              >
                <span aria-hidden="true" className="text-base flex-shrink-0">{item.emoji}</span>
                <span className="truncate max-w-[120px] sm:max-w-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}