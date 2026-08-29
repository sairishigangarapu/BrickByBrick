'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

interface ListingRow {
  id: string;
  name: string;
  category_id: string | null;
  provider_id: string | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  is_trending: boolean | null;
  minimum_investment: number | string | null;
  expected_returns: number | string | null;
  risk_level: string | null;
  liquidity: string | null;
  created_at: string;
  updated_at: string;
}

function formatAmount(v: number | string | null) {
  if (v == null) return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return String(v);
  return `₹${n.toLocaleString('en-IN')}`;
}

function formatPercent(v: number | string | null) {
  if (v == null) return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return String(v);
  return `${n}%`;
}

export default function AdminListingsPage() {
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/listings');
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
    return rows.filter((r) => r.name?.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Listings</h1>
          <p className="text-gray-500 text-sm">
            {rows.length} total · live from Supabase <code className="text-xs">investment_listings</code>
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors text-sm"
        >
          + Add New Listing
        </Link>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full md:max-w-md p-2 border border-gray-300 rounded-md text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-500 text-sm">Loading listings…</div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Liquidity</th>
                    <th className="px-4 py-3">Min Investment</th>
                    <th className="px-4 py-3">Returns</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {row.is_featured && <span className="text-orange-500">★</span>}
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{row.risk_level ?? '—'}</td>
                      <td className="px-4 py-3">{row.liquidity ?? '—'}</td>
                      <td className="px-4 py-3">{formatAmount(row.minimum_investment)}</td>
                      <td className="px-4 py-3">{formatPercent(row.expected_returns)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            row.is_published
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-200 text-zinc-800'
                          }`}
                        >
                          {row.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/listings/${row.id}`}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No listings found. Create one to populate the marketplace.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
