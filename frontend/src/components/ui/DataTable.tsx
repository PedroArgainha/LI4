import { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data, columns, searchable = true, searchKeys = [],
  pageSize = 10, emptyMessage = 'Sem registos', loading = false,
}: Props<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // Filter
  const filtered = data.filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q));
  });

  // Sort
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), 'pt');
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      {searchable && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777D]" />
          <input
            className="w-full border border-[#C4C6CC] pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#775A19] focus:ring-1 focus:ring-[#775A19] bg-white"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      )}

      <div className="overflow-x-auto border border-[#C4C6CC] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F3F4F5] border-b border-[#C4C6CC]">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#44474C] select-none ${col.sortable ? 'cursor-pointer hover:bg-[#E7E8E9]' : ''} ${col.className ?? ''}`}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === String(col.key) && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E8E9]">
            {loading ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-[#74777D]">A carregar...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-[#74777D]">{emptyMessage}</td></tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={i} className="hover:bg-[#F3F4F5] transition-colors">
                  {columns.map((col) => (
                    <td key={String(col.key)} className={`px-4 py-3 text-[#191C1D] ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : String(row[String(col.key)] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#44474C]">
          <span>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border border-[#C4C6CC] hover:bg-[#F3F4F5] disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 text-xs font-medium border ${page === p ? 'bg-[#041525] text-white border-[#041525]' : 'border-[#C4C6CC] hover:bg-[#F3F4F5]'}`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 border border-[#C4C6CC] hover:bg-[#F3F4F5] disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
