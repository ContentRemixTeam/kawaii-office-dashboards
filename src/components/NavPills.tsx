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
                  inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
                  border shadow-sm transition-all duration-200 
                  focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2
                  hover:scale-105 hover:shadow-md
                  min-h-[36px]
                  ${active
                    ? "bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200 text-pink-800 shadow-lg scale-105"
                    : "bg-white/80 hover:bg-white border-gray-200/60 text-gray-700 hover:text-gray-900 hover:border-gray-300"
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