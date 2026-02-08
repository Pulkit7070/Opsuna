'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

interface TableRow {
  id: string | number;
  [key: string]: string | number | boolean;
}

interface DataTableProps {
  title?: string;
  columns: TableColumn[];
  data: TableRow[];
  searchable?: boolean;
  pageSize?: number;
  accentColor?: 'violet' | 'blue' | 'emerald' | 'rose';
}

const colorMap = {
  violet: 'bg-violet-500',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const defaultColumns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

const defaultData: TableRow[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'Pending' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'Viewer', status: 'Inactive' },
];

export function DataTable({
  title = 'Data',
  columns = defaultColumns,
  data = defaultData,
  searchable = true,
  pageSize = 5,
  accentColor = 'violet',
}: DataTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      result = result.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDir === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="min-h-full bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
          {searchable && (
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search..."
                className="bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500 w-full sm:w-64 text-white"
              />
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-zinc-800">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`px-6 py-4 text-left text-sm font-medium text-zinc-400 ${
                      col.sortable !== false ? 'cursor-pointer hover:text-white' : ''
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.key && (
                        sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={col.key} className="px-6 py-4 text-white">
                      {idx === 0 ? (
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-sm font-medium`}>
                            {String(row[col.key]).charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{String(row[col.key])}</span>
                        </div>
                      ) : col.key === 'status' ? (
                        <span className={`px-2.5 py-1 rounded-lg text-sm ${
                          row[col.key] === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          {String(row[col.key])}
                        </span>
                      ) : (
                        <span className="text-zinc-300">{String(row[col.key])}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-zinc-800 rounded-lg transition-colors">
                      <MoreHorizontal size={18} className="text-zinc-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              Showing {paginated.length} of {filtered.length} items
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={18} className="text-white" />
              </button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    currentPage === page ? colorMap[accentColor] + ' text-white' : 'hover:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronRight size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
