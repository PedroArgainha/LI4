import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb { label: string; to?: string }

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-[#74777D] mb-4">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} className="text-[#C4C6CC]" />}
          {c.to && i < crumbs.length - 1
            ? <Link to={c.to} className="hover:text-[#041525] transition-colors">{c.label}</Link>
            : <span className={i === crumbs.length - 1 ? 'text-[#041525] font-medium' : ''}>{c.label}</span>
          }
        </span>
      ))}
    </nav>
  );
}
