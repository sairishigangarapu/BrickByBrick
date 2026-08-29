'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Download } from 'lucide-react';

interface WaitlistRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  occupation: string | null;
  income_range: string | null;
  investment_experience: string | null;
  interested_categories: string[] | null;
  investment_amount: number | string | null;
  investment_timeline: string | null;
  source: string | null;
  consent_given: boolean | null;
  created_at: string;
}

const COLUMNS: Array<{ key: keyof WaitlistRow | 'amount' | 'categories'; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'city', label: 'City' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'income_range', label: 'Income' },
  { key: 'investment_experience', label: 'Experience' },
  { key: 'categories', label: 'Interested Categories' },
  { key: 'amount', label: 'Investment Amount' },
  { key: 'investment_timeline', label: 'Timeline' },
  { key: 'source', label: 'Source' },
  { key: 'consent_given', label: 'Consent' },
  { key: 'created_at', label: 'Created' },
];

function formatCell(row: WaitlistRow, key: string): string {
  if (key === 'categories') return (row.interested_categories ?? []).join(', ');
  if (key === 'amount') {
    if (row.investment_amount == null) return '—';
    const n = typeof row.investment_amount === 'string' ? parseFloat(row.investment_amount) : row.investment_amount;
    if (!Number.isFinite(n)) return String(row.investment_amount);
    return `₹${n.toLocaleString('en-IN')}`;
  }
  if (key === 'created_at') {
    try {
      return new Date(row.created_at).toLocaleString();
    } catch {
      return row.created_at;
    }
  }
  if (key === 'consent_given') return row.consent_given ? 'Yes' : 'No';
  const value = (row as unknown as Record<string, unknown>)[key];
  if (value == null) return '—';
  return String(value);
}

function exportCsv(rows: WaitlistRow[]) {
  const header = COLUMNS.map((c) => `"${c.label}"`).join(',');
  const body = rows
    .map((r) => COLUMNS.map((c) => `"${formatCell(r, String(c.key)).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminWaitlistPage() {
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/waitlist');
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (!cancelled) setRows(data.rows ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist Leads</h1>
          <p className="text-gray-500 text-sm">
            {rows.length} total {rows.length === 1 ? 'entry' : 'entries'} · live from Supabase
          </p>
        </div>
        <button
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-lg p-4">
        <strong>Note:</strong> The CRM status workflow (Pending / Contacted) will be enabled once the
        <code className="mx-1 px-1 bg-amber-100 rounded">status</code> column is added to the waitlist table.
        Until then, leads are surfaced as they are submitted.
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              className="w-full md:max-w-md p-2 border border-gray-300 rounded-md text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-500 text-sm">Loading waitlist…</div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c.key} className="px-4 py-3 whitespace-nowrap">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {COLUMNS.map((c) => (
                        <td key={c.key} className="px-4 py-3 text-sm">
                          {formatCell(row, String(c.key))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No waitlist entries match your search.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
