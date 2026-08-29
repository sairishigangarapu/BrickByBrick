'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

function CompareContent() {
  const searchParams = useSearchParams();
  const baseId = searchParams.get('id');
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [baseListing, setBaseListing] = useState<Listing | null>(null);
  const [compareListing, setCompareListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/marketplace');
        const data: Listing[] = await res.json();
        setListings(data);
        
        if (baseId) {
          const found = data.find((item) => item.id === baseId);
          setBaseListing(found || null);
          
          // User request: Do not prefill the comparison slot
          setCompareListing(null);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [baseId]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white pt-24 pb-16 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black uppercase mb-4">Asset Comparison</h1>
          <p className="text-xl text-gray-400">Evaluate key metrics side-by-side before making your investment decision.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-gray-200">
            <div className="p-8 bg-gray-50 flex flex-col justify-center">
              <h3 className="font-bold text-gray-500 uppercase tracking-wider">Metrics</h3>
            </div>
            
            {/* Base Asset Header */}
            <div className="p-8 border-l border-gray-200">
              <div className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                {baseListing.category}
              </div>
              <h2 className="text-2xl font-black mb-2">{baseListing.name}</h2>
              <p className="text-gray-500 text-sm">By {baseListing.provider}</p>
            </div>
            
            {/* Compare Asset Header */}
            <div className="p-8 border-l border-gray-200 bg-gray-50/50 flex flex-col justify-center min-h-[200px]">
              {compareListing ? (
                <>
                  <div>
                    <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                      {compareListing.category}
                    </div>
                  </div>
                  <select 
                    className="w-full text-2xl font-black bg-transparent border-b-2 border-gray-300 pb-1 mb-2 focus:outline-none focus:border-black cursor-pointer truncate"
                    value={compareListing.id}
                    onChange={(e) => setCompareListing(listings.find(l => l.id === e.target.value) || null)}
                  >
                    {listings.filter(l => l.id !== baseListing.id).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  <p className="text-gray-500 text-sm">By {compareListing.provider}</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 mb-4 text-sm font-bold uppercase tracking-wide">Select an asset to compare</p>
                  <select 
                    className="w-full text-lg font-bold bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-black cursor-pointer"
                    onChange={(e) => setCompareListing(listings.find(l => l.id === e.target.value) || null)}
                    defaultValue=""
                  >
                    <option value="" disabled>Choose investment...</option>
                    {listings.filter(l => l.id !== baseListing.id).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {[
              { label: 'Verified Source', key: 'source' },
              { label: 'Minimum Investment', key: 'price' },
              { label: 'Indicative Returns', key: 'returns', highlight: true },
              { label: 'Risk Level', key: 'risk' },
              { label: 'Time Horizon', key: 'horizon' },
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 hover:bg-gray-50/50 transition-colors">
                <div className="p-6 text-gray-600 font-medium flex items-center bg-gray-50 border-r border-gray-200">
                  {row.label}
                </div>
                <div className={`p-6 border-r border-gray-200 flex items-center ${row.highlight ? 'text-green-600 font-black text-xl' : 'font-semibold text-gray-900'}`}>
                  {baseListing[row.key as keyof Listing]}
                </div>
                <div className={`p-6 flex items-center ${row.highlight ? 'text-green-600 font-black text-xl' : 'font-semibold text-gray-900'}`}>
                  {compareListing ? compareListing[row.key as keyof Listing] : '-'}
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer / Actions */}
          <div className="grid grid-cols-3 border-t border-gray-200 bg-gray-50">
            <div className="p-6 border-r border-gray-200"></div>
            <div className="p-6 border-r border-gray-200">
              <Link href={`/listing/${baseListing.id}`} className="block w-full text-center bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors">
                Invest in {baseListing.name.split(' ')[0]}
              </Link>
            </div>
            <div className="p-6">
              {compareListing && (
                <Link href={`/listing/${compareListing.id}`} className="block w-full text-center border-2 border-black text-black font-bold py-3 rounded-lg hover:bg-black hover:text-white transition-colors">
                  Invest in {compareListing.name.split(' ')[0]}
                </Link>
              )}
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