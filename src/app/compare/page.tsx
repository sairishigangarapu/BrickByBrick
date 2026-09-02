'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { X, Plus } from 'lucide-react';

interface Listing {
  id: string;
  name: string;
  provider: string;
  category: string;
  price: string;
  returns: string;
  risk: string;
  horizon: string;
  type: string;
  source: string;
  featured: boolean;
}

// Base asset + up to 3 comparisons => 1v1, 1v1v1 or 1v1v1v1.
const MAX_COMPARISONS = 3;

const METRIC_ROWS: { label: string; key: keyof Listing; highlight?: boolean }[] = [
  { label: 'Verified Source', key: 'source' },
  { label: 'Minimum Investment', key: 'price' },
  { label: 'Indicative Returns', key: 'returns', highlight: true },
  { label: 'Risk Level', key: 'risk' },
  { label: 'Time Horizon', key: 'horizon' },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const baseId = searchParams.get('id');

  const [listings, setListings] = useState<Listing[]>([]);
  const [baseListing, setBaseListing] = useState<Listing | null>(null);
  const [compareListings, setCompareListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/marketplace');
        const data: Listing[] = await res.json();
        setListings(data);

        if (baseId) {
          setBaseListing(data.find((item) => item.id === baseId) || null);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [baseId]);

  const availableToAdd = listings.filter(
    (l) => baseListing?.id !== l.id && !compareListings.some((c) => c.id === l.id)
  );
  const canAddMore = baseListing !== null && compareListings.length < MAX_COMPARISONS;

  function addComparison(id: string) {
    const found = listings.find((l) => l.id === id);
    if (!found || found.id === baseListing?.id) return;
    if (compareListings.some((c) => c.id === id)) return;
    if (compareListings.length >= MAX_COMPARISONS) return;
    setCompareListings((prev) => [...prev, found]);
  }

  function removeComparison(id: string) {
    setCompareListings((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-orange-500 font-black tracking-widest uppercase">Loading Comparison...</div>
      </div>
    );
  }

  if (!baseListing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-black mb-4">No Asset Selected</h1>
        <p className="text-gray-500 mb-8">Please select an investment from the marketplace to start comparing.</p>
        <Link href="/marketplace" className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
          Go to Marketplace
        </Link>
      </div>
    );
  }

  const columns = compareListings.length + (canAddMore ? 1 : 0);
  const gridTemplateColumns = `minmax(130px, 170px) repeat(${columns}, minmax(190px, 1fr))`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white pt-24 pb-16 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black uppercase mb-4">Asset Comparison</h1>
          <p className="text-xl text-gray-400">
            Compare up to {MAX_COMPARISONS + 1} investments side-by-side before making your decision.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Horizontally scrollable on phones; columns stay aligned because
              header, body and footer share one grid. */}
          <div className="overflow-x-auto">
            <div className="grid" style={{ gridTemplateColumns }}>
              {/* Table Header */}
              <div className="p-6 sm:p-8 bg-gray-50 border-b border-gray-200 flex flex-col justify-center">
                <h3 className="font-bold text-gray-500 uppercase tracking-wider">Metrics</h3>
              </div>

              {/* Base Asset Header */}
              <div className="p-6 sm:p-8 border-b border-l border-gray-200">
                <div className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                  {baseListing.category}
                </div>
                <h2 className="text-xl sm:text-2xl font-black mb-2">{baseListing.name}</h2>
                <p className="text-gray-500 text-sm">By {baseListing.provider}</p>
              </div>

              {/* Comparison Asset Headers */}
              {compareListings.map((listing) => (
                <div key={listing.id} className="p-6 sm:p-8 border-b border-l border-gray-200 bg-gray-50/50 relative">
                  <button
                    type="button"
                    onClick={() => removeComparison(listing.id)}
                    aria-label={`Remove ${listing.name} from comparison`}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    {listing.category}
                  </div>
                  <select
                    className="w-full text-lg sm:text-xl font-black bg-transparent border-b-2 border-gray-300 pb-1 mb-2 focus:outline-none focus:border-black cursor-pointer"
                    value={listing.id}
                    onChange={(e) => {
                      setCompareListings((prev) =>
                        prev.map((c) => (c.id === listing.id ? listings.find((l) => l.id === e.target.value) || c : c))
                      );
                    }}
                  >
                    {availableToAdd.concat(listing).sort((a, b) => a.name.localeCompare(b.name)).map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  <p className="text-gray-500 text-sm">By {listing.provider}</p>
                </div>
              ))}

              {/* Add-asset column */}
              {canAddMore && (
                <div className="p-6 sm:p-8 border-b border-l border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center min-h-[160px]">
                  <Plus className="w-5 h-5 text-gray-400 mb-3" aria-hidden="true" />
                  <p className="text-gray-500 mb-3 text-xs font-bold uppercase tracking-wide">Add another asset</p>
                  <select
                    className="w-full text-sm font-bold bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-black cursor-pointer"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) addComparison(e.target.value);
                    }}
                  >
                    <option value="" disabled>
                      Choose investment...
                    </option>
                    {availableToAdd.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Table Body */}
              {METRIC_ROWS.map((row) => (
                <React.Fragment key={row.key}>
                  <div className="p-4 sm:p-6 text-gray-600 font-medium flex items-center bg-gray-50 border-b border-r border-gray-200 text-sm sm:text-base">
                    {row.label}
                  </div>
                  <div className={`p-4 sm:p-6 border-b border-r border-gray-200 flex items-center ${row.highlight ? 'text-green-600 font-black text-lg sm:text-xl' : 'font-semibold text-gray-900 text-sm sm:text-base'}`}>
                    {baseListing[row.key]}
                  </div>
                  {compareListings.map((listing) => (
                    <div
                      key={listing.id}
                      className={`p-4 sm:p-6 border-b border-r last:border-r-0 border-gray-200 flex items-center ${row.highlight ? 'text-green-600 font-black text-lg sm:text-xl' : 'font-semibold text-gray-900 text-sm sm:text-base'}`}
                    >
                      {listing[row.key]}
                    </div>
                  ))}
                  {canAddMore && (
                    <div className="p-4 sm:p-6 border-b border-l border-gray-200 bg-gray-50/50 text-gray-300 text-sm">—</div>
                  )}
                </React.Fragment>
              ))}

              {/* Table Footer / Actions */}
              <div className="p-4 sm:p-6 border-r border-gray-200 bg-gray-50"></div>
              <div className="p-4 sm:p-6 border-r border-gray-200 bg-gray-50">
                <Link
                  href={`/listing/${baseListing.id}`}
                  className="block w-full text-center bg-black text-white font-bold py-3 px-2 rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm"
                >
                  Invest in {baseListing.name.split(' ')[0]}
                </Link>
              </div>
              {compareListings.map((listing) => (
                <div key={listing.id} className="p-4 sm:p-6 border-r last:border-r-0 border-gray-200 bg-gray-50">
                  <Link
                    href={`/listing/${listing.id}`}
                    className="block w-full text-center border-2 border-black text-black font-bold py-3 px-2 rounded-lg hover:bg-black hover:text-white transition-colors text-xs sm:text-sm"
                  >
                    Invest in {listing.name.split(' ')[0]}
                  </Link>
                </div>
              ))}
              {canAddMore && <div className="p-4 sm:p-6 bg-gray-50"></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center animate-pulse font-black uppercase text-orange-500">Loading Comparison Engine...</div>}>
      <CompareContent />
    </Suspense>
  );
}
