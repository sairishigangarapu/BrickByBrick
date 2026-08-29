import Link from 'next/link';
import {
  Building2,
  Zap,
  TrendingUp,
  Briefcase,
  Handshake,
  ScrollText,
  Puzzle,
  Home,
  Factory,
  Coins,
  ArrowRight,
  Flame,
  Newspaper,
  CheckCircle2,
} from 'lucide-react';

import { WaitlistForm } from '@/components/public/WaitlistForm';
import { getListings } from '@/lib/marketplace';
import { getLatestNews } from '@/lib/news';
import { getNewsCategoryLabel, type NewsArticle } from '@/lib/news-categories';
import { getTrendingListings, type Listing } from '@/lib/listing-utils';
import { formatDistanceToNowStrict } from 'date-fns';

const categories = [
  { name: 'REITs', icon: Building2 },
  { name: 'InvITs', icon: Zap },
  { name: 'AIFs', icon: TrendingUp },
  { name: 'PMS', icon: Briefcase },
  { name: 'Private Credit', icon: Handshake },
  { name: 'Corporate Bonds', icon: ScrollText },
  { name: 'Structured Products', icon: Puzzle },
  { name: 'Fractional Real Estate', icon: Home },
  { name: 'Infrastructure', icon: Factory },
  { name: 'Gold', icon: Coins },
];

const panelClass =
  'bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:border-orange-300 transition-colors';
const panelHeadingClass = 'flex items-center justify-between gap-3 mb-5';
const panelTitleClass = 'text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-2';

function formatArticleTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return '';
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return '';
  }
}

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  // Server-side data reuse — pages call the shared data layer directly instead
  // of HTTP-calling their own API routes. Failures degrade gracefully.
  let listings: Listing[] = [];
  let latestNews: NewsArticle[] = [];
  try {
    listings = await getListings({ limit: 12 });
  } catch (error) {
    console.error('Landing page: failed to load listings:', error);
  }
  try {
    latestNews = await getLatestNews(5);
  } catch (error) {
    console.error('Landing page: failed to load news:', error);
  }

  const trendingListings = getTrendingListings(listings, 3);
  const featuredListings = (
    listings.filter((listing) => listing.featured).length >= 3
      ? listings.filter((listing) => listing.featured)
      : listings
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="w-full bg-black text-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-24 md:px-10 md:py-32 flex flex-col items-center text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500 mb-6">BrickByBrick</p>
          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[1.1] md:text-7xl">
            India's Marketplace for <span className="text-orange-500">Alternative Investments</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg text-zinc-300 md:text-xl">
            Discover, compare, understand, and access alternative investment opportunities through trusted investment partners.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center">
            <Link
              href="/marketplace"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg transition-colors flex-1"
            >
              Explore Marketplace
            </Link>
            <Link
              href="/discover"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-8 rounded-lg transition-colors flex-1"
            >
              Discover News
            </Link>
            <Link
              href="/learning-hub"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-8 rounded-lg transition-colors flex-1"
            >
              Start Learning
            </Link>
          </div>

          <div className="mt-16 w-full max-w-2xl bg-white p-2 rounded-xl">
            <WaitlistForm />
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-400">Join the waitlist for early access to our AI Copilot</p>
        </div>
      </section>

      {/* Bento Grid */}
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

          {/* Trending investments — largest content panel */}
          <section className={`${panelClass} md:col-span-4`} aria-label="Trending investments">
            <div className={panelHeadingClass}>
              <h2 className={panelTitleClass}>
                <Flame className="w-4 h-4 text-orange-600" aria-hidden="true" /> Trending Now
              </h2>
              <Link href="/marketplace" className="text-orange-600 text-sm font-bold hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
            {trendingListings.length > 0 ? (
              <ul className="divide-y divide-gray-100 -my-2">
                {trendingListings.map((listing, index) => (
                  <li key={listing.id}>
                    <Link
                      href={`/listing/${listing.id}`}
                      className="group flex items-center gap-4 py-3.5 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                    >
                      <span className="w-8 h-8 shrink-0 rounded-lg bg-black text-white text-sm font-black flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate group-hover:text-orange-700 transition-colors">{listing.name}</p>
                        <p className="text-xs text-gray-500 truncate">{listing.provider}</p>
                      </div>
                      <span className="hidden sm:inline-block shrink-0 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {listing.category}
                      </span>
                      <div className="shrink-0 text-right">
                        <p className="font-bold text-sm">{listing.price}</p>
                        <p className="text-xs font-bold text-green-600">{listing.returns}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Trending opportunities will appear here shortly.</p>
            )}
          </section>

          {/* Key market indicators */}
          <section className={`${panelClass} md:col-span-2 bg-black text-white border-black`} aria-label="Platform indicators">
            <div className={panelHeadingClass}>
              <h2 className={`${panelTitleClass} text-zinc-400`}>
                <TrendingUp className="w-4 h-4 text-orange-500" aria-hidden="true" /> At a Glance
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div>
                <p className="text-3xl font-black text-orange-500 mb-1">{Math.max(listings.length, 0)}+</p>
                <p className="text-xs text-zinc-400">Live Opportunities</p>
              </div>
              <div>
                <p className="text-3xl font-black text-orange-500 mb-1">{categories.length}+</p>
                <p className="text-xs text-zinc-400">Asset Categories</p>
              </div>
              <div>
                <p className="text-3xl font-black text-orange-500 mb-1">SEBI</p>
                <p className="text-xs text-zinc-400">Regulated Partners</p>
              </div>
              <div>
                <p className="text-3xl font-black text-orange-500 mb-1">10k+</p>
                <p className="text-xs text-zinc-400">Educated Investors</p>
              </div>
            </div>
          </section>

          {/* Latest news — Discover preview (tall) */}
          <section className={`${panelClass} md:col-span-2 md:row-span-2`} aria-label="Latest financial news">
            <div className={panelHeadingClass}>
              <h2 className={panelTitleClass}>
                <Newspaper className="w-4 h-4 text-orange-600" aria-hidden="true" /> Market Pulse
              </h2>
              <Link href="/discover" className="text-orange-600 text-sm font-bold hover:underline inline-flex items-center gap-1">
                Discover <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
            {latestNews.length > 0 ? (
              <ul className="space-y-4">
                {latestNews.map((article) => (
                  <li key={article.id}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded-md"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide text-orange-700 mb-1">
                        {getNewsCategoryLabel(article.categoryId)}
                      </p>
                      <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-orange-700 transition-colors">
                        {article.title}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {article.source}
                        {formatArticleTime(article.publishedAt) && ` · ${formatArticleTime(article.publishedAt)}`}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Live market headlines will stream in here. Visit{' '}
                <Link href="/discover" className="text-orange-600 font-bold hover:underline">Discover</Link> for the full feed.
              </p>
            )}
          </section>

          {/* Marketplace preview — featured opportunities */}
          <section className={`${panelClass} md:col-span-4`} aria-label="Featured investment opportunities">
            <div className={panelHeadingClass}>
              <h2 className={panelTitleClass}>Featured Opportunities</h2>
              <Link href="/marketplace" className="text-orange-600 text-sm font-bold hover:underline inline-flex items-center gap-1">
                Browse marketplace <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
            {featuredListings.length > 0 ? (
              <div className="grid sm:grid-cols-3 gap-4 mt-auto">
                {featuredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="group rounded-xl border border-gray-200 p-4 hover:border-orange-400 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                  >
                    <span className="inline-block bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mb-2 max-w-full truncate">
                      {listing.category}
                    </span>
                    <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-orange-700 transition-colors mb-1">
                      {listing.name}
                    </p>
                    <p className="text-xs font-bold text-green-600">{listing.returns}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{listing.price}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Featured opportunities will appear here shortly.</p>
            )}
          </section>

          {/* Category quick nav */}
          <section className={`${panelClass} md:col-span-4 md:row-span-1 bg-zinc-50`} aria-label="Investment categories">
            <div className={panelHeadingClass}>
              <h2 className={panelTitleClass}>Explore Categories</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/marketplace?category=${encodeURIComponent(category.name === 'AIFs' ? 'Category II AIF' : category.name)}`}
                  className="group flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 hover:border-orange-500 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                >
                  <category.icon className="w-4 h-4 shrink-0 text-orange-600 group-hover:scale-110 transition-transform stroke-[1.5px]" aria-hidden="true" />
                  <span className="text-xs font-bold truncate">{category.name}</span>
                </Link>
              ))}
            </div>
            <Link
              href="/categories"
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:underline"
            >
              All categories <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </section>

          {/* Learning bridge CTA */}
          <section className={`${panelClass} md:col-span-6 bg-zinc-50`} aria-label="Learn before you invest">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">Understand before you invest</h2>
                <p className="text-zinc-600 mb-6 max-w-lg">
                  Alternative investments carry unique risks and structures. Build your knowledge with structured learning paths,
                  hands-on tools, and research updates.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/learning-hub"
                    className="border-2 border-black font-bold py-2.5 px-6 rounded-lg hover:bg-black hover:text-white transition-colors text-sm"
                  >
                    Go to Learning Hub
                  </Link>
                  <Link
                    href="/calculators"
                    className="border-2 border-gray-300 font-bold py-2.5 px-6 rounded-lg hover:border-gray-800 transition-colors text-sm"
                  >
                    Explore Calculators
                  </Link>
                </div>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {[
                  'In-depth Learning Paths',
                  'Financial Calculators',
                  'Risk Assessment Tools',
                  'SEBI & Tax Updates',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold">
                    <CheckCircle2 className="text-orange-500 w-4 h-4 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 px-4 py-16 text-white md:px-8 border-t border-zinc-800">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <p className="text-2xl font-black uppercase tracking-[0.3em] text-orange-500 mb-4">BrickByBrick</p>
              <p className="text-zinc-400 max-w-sm mb-6">India's Marketplace for Alternative Investments. Discover, learn, and invest with clarity.</p>
              <a href="mailto:connect.brickbybrick@gmail.com" className="text-zinc-400 hover:text-white transition-colors">
                connect.brickbybrick@gmail.com
              </a>
            </div>

            <div>
              <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Platform</h4>
              <ul className="space-y-3 text-zinc-400">
                <li><Link href="/marketplace" className="hover:text-white">Marketplace</Link></li>
                <li><Link href="/discover" className="hover:text-white">Discover</Link></li>
                <li><Link href="/learning-hub" className="hover:text-white">Learning Hub</Link></li>
                <li><Link href="/calculators" className="hover:text-white">Calculators</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Connect</h4>
              <ul className="space-y-3 text-zinc-400">
                <li><a href="https://www.linkedin.com/company/brickbybrick-sip/" target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a></li>
                <li><a href="https://www.instagram.com/_brick_by.brick_/" target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs text-zinc-600 border-t border-zinc-800 pt-8 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} BrickByBrick. All rights reserved.</p>
            <div className="flex gap-4">
              <p>BrickByBrick is an education and discovery platform. Not an investment advisor.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
