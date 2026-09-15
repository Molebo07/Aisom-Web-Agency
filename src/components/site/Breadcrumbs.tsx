import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="wrap pt-8">
      <ol className="flex flex-wrap items-center gap-1 text-[12px] text-ash">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-slate">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link to={item.path} className="hover:text-slate hover:underline">
                    {item.name}
                  </Link>
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
