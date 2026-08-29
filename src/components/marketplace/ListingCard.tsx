'use client';

import React from 'react';
import Link from 'next/link';
import type { Listing } from '@/lib/listing-utils';

interface ListingCardProps {
  listing: Listing;
  onJoinWaitlist: (listing: Listing) => void;
}

export function ListingCard({ listing, onJoinWaitlist }: ListingCardProps) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col h-full hover:shadow-lg transition-shadow focus-within:ring-1 focus-within:ring-brand-primary">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
          {listing.category}
        </span>
        {listing.featured && (
          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            ★ Featured
          </span>
        )}
      </div>

      <h3 className="text-lg font-black leading-snug mb-1 line-clamp-2">{listing.name}</h3>
      <p className="text-gray-500 text-xs mb-4 truncate">
        By <span className="font-semibold text-gray-700">{listing.provider}</span> ·{' '}
        <span className="text-green-700 font-medium">Verified by {listing.source}</span>
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Price / Min</p>
          <p className="font-bold text-sm text-gray-900 truncate" title={listing.price}>{listing.price}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Returns</p>
          <p className="font-bold text-sm text-green-600 truncate" title={listing.returns}>{listing.returns}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Risk</p>
          <p className="font-bold text-sm text-gray-900 truncate" title={listing.risk}>{listing.risk}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Horizon</p>
          <p className="font-bold text-sm text-gray-900 truncate" title={listing.horizon}>{listing.horizon}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100">
        <Link
          href={`/listing/${listing.id}`}
          className="block text-center w-full bg-black hover:bg-gray-800 text-white font-bold py-2 rounded-lg transition-colors text-sm"
        >
          View Details
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/compare?id=${listing.id}`}
            className="block text-center w-full border-2 border-gray-200 text-black hover:border-gray-800 font-bold py-1.5 rounded-lg transition-colors text-xs"
          >
            Compare
          </Link>
          <button
            type="button"
            onClick={() => onJoinWaitlist(listing)}
            className="w-full text-orange-600 font-bold py-1.5 rounded-lg transition-colors text-xs hover:bg-orange-50"
          >
            Join Waitlist
          </button>
        </div>
      </div>
    </article>
  );
}
