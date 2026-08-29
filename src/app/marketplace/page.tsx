'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ListFilter, Search, X } from 'lucide-react';

import { WaitlistForm } from '@/components/public/WaitlistForm';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { FilterPanel, FilterChip, type MarketplaceFilters } from '@/components/marketplace/FilterPanel';
import { TrendingStrip } from '@/components/marketplace/TrendingStrip';
import {
  MARKETPLACE_CATEGORIES,
  getTrendingListings,
  matchesCategoryFilter,
  parsePriceValue,
  parseReturnValue,
  searchListings,
  trendingScore,
  type Listing,
} from '@/lib/listing-utils';

const DEFAULT_FILTERS: MarketplaceFilters = { category: 'All', risks: [], sources: [] };

function countActiveFilters(filters: MarketplaceFilters): number {
  return (
    (filters.category !== 'All' ? 1 : 0) +
    filters.risks.length +
    filters.sources.length
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistListing, setWaitlistListing] = useState<Listing | null>(null);

  // Search: debounced locally — the full dataset is fetched once, so typing
  // never triggers extra API calls.
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Trending');

  // Full-dataset fetch (single call). The API caps default results at 3;
  // limit=1000 returns everything available for client-side search/filtering.
  const fetchListings = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/marketplace?limit=1000');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Unexpected response format');
      setAllListings(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setLoadError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Debounce the search query (300ms).
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Support deep links like /marketplace?category=REITs (used by the landing page).
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && MARKETPLACE_CATEGORIES.includes(categoryParam as never)) {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
    }
  }, [searchParams]);

  // Facet options are derived from the actual dataset so filters always match reality.
  const riskOptions = useMemo(
    () => [...new Set(allListings.map((l) => l.risk))].sort(),
    [allListings]
  );
  const sourceOptions = useMemo(
    () => [...new Set(allListings.map((l) => l.source))].sort(),
    [allListings]
  );

  const filteredListings = useMemo(() => {
    let result = searchListings(allListings, searchQuery);
    if (filters.category !== 'All') {
      result = result.filter((listing) => matchesCategoryFilter(listing.category, filters.category));
    }
    if (filters.risks.length > 0) {
      result = result.filter((listing) =>
        filters.risks.some((risk) => listing.risk.toLowerCase().includes(risk.toLowerCase()))
      );
    }
    if (filters.sources.length > 0) {
      result = result.filter((listing) => filters.sources.includes(listing.source));
    }

    const sorted = [...result];
    switch (sortBy) {
      case 'Trending':
        sorted.sort((a, b) => trendingScore(b) - trendingScore(a));
        break;
      case 'Featured':
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
        break;
      case 'Newest':
        sorted.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'Highest Returns': {
        // Numeric comparison on parsed percentages; unparsed ("Market Linked") sort last.
        sorted.sort((a, b) => (parseReturnValue(b.returns) ?? -1) - (parseReturnValue(a.returns) ?? -1));
        break;
      }
      case 'Lowest Investment': {
        sorted.sort((a, b) => (parsePriceValue(a.price) ?? Infinity) - (parsePriceValue(b.price) ?? Infinity));
        break;
      }
    }
    return sorted;
  }, [allListings, searchQuery, filters, sortBy]);

  const trendingListings = useMemo(() => getTrendingListings(allListings, 4), [allListings]);
  const hasActiveCriteria =
    searchQuery.trim() !== '' || countActiveFilters(filters) > 0;

  // Progressive rendering keeps the grid smooth with the full dataset loaded.
  const PAGE_SIZE = 36;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, filters, sortBy]);
  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredListings.length;

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
    setSearchQuery('');
  };

  const openWaitlist = (listing?: Listing) => {
    setWaitlistListing(listing ?? null);
    setIsWaitlistModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header band */}
      <div className="bg-black text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">Investment Marketplace</h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Discover, compare, and understand alternative investments from trusted providers.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Toolbar: search + filter + sort */}
        <div className="relative flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search all listings by name, provider, category, asset type..."
              aria-label="Search marketplace"
              className="w-full h-11 pl-10 pr-9 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {/* Visible Filter button with active-count badge */}
            <button
              type="button"
              onClick={() => setIsFilterOpen((open) => !open)}
              aria-expanded={isFilterOpen}
              aria-haspopup="dialog"
              className={`relative h-11 inline-flex items-center gap-2 px-5 rounded-xl font-bold text-sm border transition-colors ${
                isFilterOpen
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-200 hover:border-gray-400'
              }`}
            >
              <ListFilter className="w-4 h-4" aria-hidden="true" />
              Filter
              {countActiveFilters(filters) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center">
                  {countActiveFilters(filters)}
                </span>
              )}
            </button>

            <label className="sr-only" htmlFor="sort-select">Sort by</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 border border-gray-200 rounded-xl px-3 text-sm bg-white font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
            >
              <option>Trending</option>
              <option>Featured</option>
              <option>Newest</option>
              <option>Highest Returns</option>
              <option>Lowest Investment</option>
            </select>
          </div>

          {/* Filter panel popover */}
          <FilterPanel
            open={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            categories={MARKETPLACE_CATEGORIES}
            riskOptions={riskOptions}
            sourceOptions={sourceOptions}
            filters={filters}
            onCategoryChange={(category) => setFilters((prev) => ({ ...prev, category }))}
            onToggleRisk={(risk) =>
              setFilters((prev) => ({
                ...prev,
                risks: prev.risks.includes(risk)
                  ? prev.risks.filter((r) => r !== risk)
                  : [...prev.risks, risk],
              }))
            }
            onToggleSource={(source) =>
              setFilters((prev) => ({
                ...prev,
                sources: prev.sources.includes(source)
                  ? prev.sources.filter((s) => s !== source)
                  : [...prev.sources, source],
              }))
            }
            onClearAll={clearAllFilters}
          />
        </div>

        {/* Active filter chips */}
        {(countActiveFilters(filters) > 0 || searchInput) && (
          <div className="flex flex-wrap items-center gap-2 mb-6" role="status" aria-label="Active filters">
            {searchInput.trim() && (
              <FilterChip label={`Search: "${searchInput.trim()}"`} onRemove={() => setSearchInput('')} />
            )}
            {filters.category !== 'All' && (
              <FilterChip
                label={`Category: ${filters.category}`}
                onRemove={() => setFilters((prev) => ({ ...prev, category: 'All' }))}
              />
            )}
            {filters.risks.map((risk) => (
              <FilterChip
                key={risk}
                label={`Risk: ${risk}`}
                onRemove={() =>
                  setFilters((prev) => ({ ...prev, risks: prev.risks.filter((r) => r !== risk) }))
                }
              />
            ))}
            {filters.sources.map((source) => (
              <FilterChip
                key={source}
                label={`Source: ${source}`}
                onRemove={() =>
                  setFilters((prev) => ({ ...prev, sources: prev.sources.filter((s) => s !== source) }))
                }
              />
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-orange-700 transition-colors underline underline-offset-2 ml-1"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Trending section — distinct from the main grid, hidden while narrowing down */}
        {!hasActiveCriteria && !loading && !loadError && <TrendingStrip listings={trendingListings} />}

        {/* Result meta row */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 font-medium text-sm" role="status">
            {loading
              ? 'Loading opportunities...'
              : `Showing ${filteredListings.length} of ${allListings.length} opportunities`}
          </p>
          <Link href="/compare" className="hidden md:block text-sm text-orange-600 font-bold hover:underline">
            Compare assets →
          </Link>
        </div>

        {/* Error state */}
        {loadError && !loading && (
          <div className="bg-white rounded-xl border border-red-200 p-10 text-center mb-8">
            <p className="font-bold text-lg mb-1">Could not load marketplace data</p>
            <p className="text-gray-500 text-sm mb-6">{loadError}. Please try again.</p>
            <button
              type="button"
              onClick={fetchListings}
              className="bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" aria-busy="true" aria-label="Loading listings">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-5 w-24 bg-gray-100 rounded-full mb-4" />
                <div className="h-5 w-3/4 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 rounded mb-6" />
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <div key={j}>
                      <div className="h-2.5 w-14 bg-gray-100 rounded mb-1.5" />
                      <div className="h-4 w-20 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
                <div className="h-9 w-full bg-gray-100 rounded-lg mb-2" />
                <div className="h-8 w-full bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Listings grid */}
        {!loading && !loadError && (
          <>
            {filteredListings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {visibleListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} onJoinWaitlist={() => openWaitlist(listing)} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                      className="border-2 border-gray-300 hover:border-black font-bold py-2.5 px-8 rounded-lg transition-colors text-sm"
                    >
                      Load more ({filteredListings.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-900 font-black text-xl mb-2">No matching opportunities</p>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  No listings match your current search or filters. Try adjusting or clearing them.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Waitlist modal (preserved behaviour) */}
      {isWaitlistModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Join the waitlist"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWaitlistModalOpen(false);
          }}
        >
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full relative">
            <button
              onClick={() => setIsWaitlistModalOpen(false)}
              aria-label="Close waitlist dialog"
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black uppercase mb-2">Join the Waitlist</h2>
            <p className="text-gray-500 mb-6 text-sm">
              {waitlistListing
                ? `Sign up for early access and updates about ${waitlistListing.name} and other investment opportunities.`
                : 'Sign up to get early access and important updates about these investment opportunities.'}
            </p>
            <WaitlistForm />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center animate-pulse font-black uppercase text-orange-500">
          Loading Marketplace...
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
