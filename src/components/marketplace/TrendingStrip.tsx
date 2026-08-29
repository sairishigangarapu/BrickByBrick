'use client';

import React from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import type { Listing } from '@/lib/listing-utils';

interface TrendingStripProps {
  listings: Listing[];
}

/**
 * Compact horizontal strip highlighting trending listings.
 * Ranking is computed deterministically from API signals (featured flag,
 * source priority) via getTrendingListings() — see listing-utils.
 */
export function TrendingStrip({ listings }: TrendingStripProps) {
  if (listings.length === 0) return null;

  return (
    <section aria-label="Trending investments" className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-orange-600" aria-hidden="true" />
        <h2 className="text-sm font-black uppercase tracking-wider">Trending Now</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {listings.map((listing, index) => (
          <Link
            key={listing.id}
            href={`/listing/${listing.id}`}
            className="group snap-start shrink-0 w-[260px] bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-500 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black flex items-center justify-center">
                {index + 1}
              </span>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide max-w-[70%] truncate">
                {listing.category}
              </span>
            </div>
            <h3 className="font-bold text-sm leading-snug mb-1 line-clamp-1 group-hover:text-orange-700 transition-colors">
              {listing.name}
            </h3>
            <p className="text-xs text-gray-500 truncate mb-3">{listing.provider}</p>
            <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
              <span className="font-bold text-gray-900 truncate mr-2" title={listing.price}>{listing.price}</span>
              <span className="font-bold text-green-600 truncate" title={listing.returns}>{listing.returns}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
