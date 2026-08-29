'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Mail, GitCompareArrows, Bell, Newspaper, BookOpen, ShieldAlert } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

import { WaitlistForm } from '@/components/public/WaitlistForm';
import { DisclaimerPopup } from '@/components/ui/DisclaimerPopup';
import { ArticleCard } from '@/components/discover/ArticleCard';
import type { Listing } from '@/lib/listing-utils';
import { pickCategoryIdForListing, getNewsCategoryLabel, type NewsArticle } from '@/lib/news-categories';

interface AssetDetailsContentProps {
  listing: Listing;
  relatedNews: NewsArticle[];
}

function buildOverview(listing: Listing): string {
  return `${listing.name} is a ${listing.category.toLowerCase()} offered by ${listing.provider} and verified by ${listing.source}. The instrument is targeted at investors seeking ${listing.horizon.toLowerCase()} exposure, with an indicative return profile of ${listing.returns} and a stated minimum investment of ${listing.price}. The risk classification reported by the data source is ${listing.risk}.`;
}

function buildStrategy(listing: Listing): string {
  const c = listing.category.toLowerCase();
  if (c.includes('reit')) {
    return 'Yield-oriented commercial real estate exposure with periodic distributions derived from rental income across the underlying property portfolio.';
  }
  if (c.includes('invit')) {
    return 'Long-duration infrastructure exposure with distributions linked to the operational cash flows of the underlying assets (power transmission, roads, renewables, etc.).';
  }
  if (c.includes('aif')) {
    return 'Pooled alternative-investment strategy with manager discretion over asset selection, intended for sophisticated investors comfortable with illiquidity and lock-up.';
  }
  if (c.includes('bond')) {
    return 'Fixed-income strategy with coupon-based returns and defined maturity. Investor return is driven by coupon yield and any change in credit spread over the holding period.';
  }
  if (c.includes('private credit')) {
    return 'Direct-lending strategy providing senior or mezzanine debt to operating businesses, with returns driven by contractual interest and disciplined underwriting.';
  }
  if (c.includes('mutual fund')) {
    return 'Diversified, manager-driven portfolio investing in listed equities and/or fixed income. Returns depend on the underlying asset mix and prevailing market conditions.';
  }
  if (c.includes('pms')) {
    return 'Discretionary (or non-discretionary) portfolio management with bespoke asset allocation across listed securities, tailored to a defined mandate.';
  }
  if (c.includes('global')) {
    return 'International alternatives exposure (private equity, hedge funds, or similar) with a long-term horizon and limited liquidity.';
  }
  return `${listing.category} strategy with a ${listing.horizon.toLowerCase()} holding period and risk profile of ${listing.risk}.`;
}

function buildUnderlying(listing: Listing): string {
  const c = listing.category.toLowerCase();
  if (c.includes('reit')) return 'Income-producing commercial real estate assets held by the trust.';
  if (c.includes('invit')) return 'Operational infrastructure assets such as power transmission lines, road concessions, or renewable projects.';
  if (c.includes('aif')) return 'Underlying portfolio selected by the fund manager in line with the fund\'s stated mandate (private equity, venture, credit, or hedge).';
  if (c.includes('bond')) return 'Senior or subordinated debt instruments issued by corporates or financial institutions.';
  if (c.includes('private credit')) return 'Senior secured or mezzanine loans to operating companies, originated or arranged by the platform.';
  if (c.includes('mutual fund')) return 'Listed equity, debt, or hybrid securities, in line with the scheme\'s stated investment objective.';
  if (c.includes('pms')) return 'Listed equity, debt, or hybrid securities selected under a discretionary or non-discretionary mandate.';
  if (c.includes('global')) return 'International private-market and hedge-fund instruments accessed via feeder structures or co-investment vehicles.';
  return 'Underlying instruments consistent with the asset class description above.';
}

function buildLiquidity(listing: Listing): string {
  const t = (listing.type || '').toLowerCase();
  if (t.includes('listed')) return 'Listed — daily price discovery on the exchange.';
  if (t.includes('fund')) return 'Open-end fund — daily NAV, subject to exit load.';
  if (t.includes('aif')) return 'AIF — periodic drawdown and distribution; subject to fund lock-in.';
  return 'Liquidity terms vary; contact the provider for the latest window.';
}

function riskCaption(risk: string): string {
  const r = risk.toLowerCase();
  if (r.includes('very high')) return 'Suitable only for investors who can absorb a total loss of capital.';
  if (r.includes('high')) return 'Material downside risk; volatility in returns is expected.';
  if (r.includes('moderate') || r.includes('medium')) return 'Balanced risk-reward; capital erosion possible in adverse scenarios.';
  if (r.includes('low')) return 'Lower historical volatility; capital preservation is a priority, not a guarantee.';
  return 'Risk profile is not categorised by the data source.';
}

function formatArticleTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return '';
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return '';
  }
}

export function AssetDetailsContent({ listing, relatedNews }: AssetDetailsContentProps) {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const emailSubject = encodeURIComponent(`Interested in ${listing.name}`);
  const categoryId = pickCategoryIdForListing(listing);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Hero */}
      <header className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              {listing.category}
            </span>
            <span className="bg-emerald-900/40 text-emerald-300 border border-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Verified by {listing.source}
            </span>
            {listing.featured && (
              <span className="bg-blue-900/40 text-blue-200 border border-blue-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
            {listing.name}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300">
            Managed by <span className="text-white font-semibold">{listing.provider}</span>
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Key metrics row */}
        <section aria-label="Key metrics" className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Metric label="Minimum Investment" value={listing.price} />
          <Metric label="Tenure" value={listing.horizon} />
          <Metric label="Indicative Returns" value={listing.returns} tone="positive" />
          <Metric label="Liquidity" value={buildLiquidity(listing)} />
          <Metric label="Management Fee" value="Not disclosed" sublabel="Contact provider" />
        </section>

        {/* Primary actions */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Primary actions">
          <a
            href={`mailto:connect.brickbybrick@gmail.com?subject=${emailSubject}`}
            className="flex items-center justify-center gap-2 h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors text-sm uppercase tracking-wider"
          >
            <Mail className="w-4 h-4" aria-hidden="true" /> Access Through Partner
          </a>
          <Link
            href={`/compare?id=${encodeURIComponent(listing.id)}`}
            className="flex items-center justify-center gap-2 h-12 bg-black hover:bg-zinc-800 text-white font-bold rounded-lg transition-colors text-sm uppercase tracking-wider"
          >
            <GitCompareArrows className="w-4 h-4" aria-hidden="true" /> Add to Compare
          </Link>
          <button
            type="button"
            onClick={() => setIsWaitlistOpen(true)}
            className="flex items-center justify-center gap-2 h-12 border-2 border-orange-600 text-orange-700 hover:bg-orange-50 font-bold rounded-lg transition-colors text-sm uppercase tracking-wider"
          >
            <Bell className="w-4 h-4" aria-hidden="true" /> Join Waitlist
          </button>
        </section>

        {/* Summary */}
        <section className="grid lg:grid-cols-2 gap-6" aria-label="Asset summary">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-black uppercase mb-3">Overview</h2>
            <p className="text-sm text-zinc-700 leading-relaxed">{buildOverview(listing)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-black uppercase mb-3">Investment Strategy</h2>
            <p className="text-sm text-zinc-700 leading-relaxed">{buildStrategy(listing)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-black uppercase mb-3">Underlying Assets</h2>
            <p className="text-sm text-zinc-700 leading-relaxed">{buildUnderlying(listing)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-black uppercase mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-600" aria-hidden="true" /> Risk
            </h2>
            <p className="text-2xl font-black mb-1">{listing.risk}</p>
            <p className="text-sm text-zinc-600 leading-relaxed">{riskCaption(listing.risk)}</p>
          </div>
        </section>

        {/* Educational content */}
        <section className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" aria-label="Educational content">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-orange-600 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-base font-black uppercase mb-1">Learn before you invest</h2>
              <p className="text-sm text-zinc-600">
                Build context on {listing.category.toLowerCase()} with our structured learning paths.
              </p>
            </div>
          </div>
          <Link
            href={`/learning-hub?topic=${categoryId}`}
            className="self-start sm:self-auto inline-flex items-center justify-center h-11 px-5 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Open Learning Hub
          </Link>
        </section>

        {/* Recent news */}
        <section aria-label="Recent news" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-black uppercase flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-orange-600" aria-hidden="true" /> Recent News
            </h2>
            <Link
              href={`/discover`}
              className="text-sm font-bold text-orange-600 hover:underline"
            >
              All coverage →
            </Link>
          </div>

          {relatedNews.length > 0 ? (
            <>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                Showing {getNewsCategoryLabel(categoryId)} coverage
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedNews.slice(0, 6).map((article) => (
                  <li key={article.id}>
                    <ArticleCard article={article} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <Newspaper className="w-6 h-6 text-zinc-300 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm font-semibold text-zinc-700">No recent coverage for this asset right now.</p>
              <p className="text-xs text-zinc-500 mt-1">
                Check the{' '}
                <Link href="/discover" className="text-orange-600 font-bold hover:underline">
                  Discover feed
                </Link>{' '}
                for the latest market headlines.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Persistent investment disclaimer (dismissable) */}
      <DisclaimerPopup variant="banner" />

      {/* Waitlist modal */}
      {isWaitlistOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Join the waitlist"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWaitlistOpen(false);
          }}
        >
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full relative">
            <button
              onClick={() => setIsWaitlistOpen(false)}
              aria-label="Close waitlist dialog"
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black uppercase mb-2">Join the Waitlist</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Sign up for early access and updates about {listing.name} and other investment opportunities.
            </p>
            <WaitlistForm />
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  sublabel,
  tone,
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: 'positive';
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
      <p
        className={`font-black text-base sm:text-lg leading-tight ${
          tone === 'positive' ? 'text-emerald-600' : 'text-zinc-900'
        }`}
      >
        {value}
      </p>
      {sublabel ? <p className="text-[11px] text-zinc-500 mt-1">{sublabel}</p> : null}
    </div>
  );
}
