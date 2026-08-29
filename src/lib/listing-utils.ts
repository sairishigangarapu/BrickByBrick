// Shared, pure helpers for marketplace listings.
// Used by both server components and client components — must stay dependency-free.

export interface Listing {
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

/**
 * Parses Indian-formatted money strings into absolute rupee values.
 * Handles formats produced by the API such as:
 *   "₹1 Cr (Min)" -> 10_000_000
 *   "₹25.5 L (Min)" -> 2_550_000
 *   "₹375.40 (Live)" -> 375.4
 */
export function parsePriceValue(price: string): number | null {
  if (!price) return null;
  const match = price.replace(/,/g, '').match(/₹\s*([\d.]+)\s*(cr|crore|l|lakh|k)?/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value)) return null;
  const unit = match[2]?.toLowerCase();
  const multiplier =
    unit === 'cr' || unit === 'crore' ? 1_000_000_00 :
    unit === 'l' || unit === 'lakh' ? 1_00_000 :
    unit === 'k' ? 1_000 : 1;
  return value * multiplier;
}

/**
 * Extracts a comparable percentage from returns strings such as:
 *   "14-16% (Indicative)" -> 16   (upper bound of the range)
 *   "10.2% (Yield)"       -> 10.2
 *   "Market Linked"       -> null (unranked, sorted last)
 */
export function parseReturnValue(returns: string): number | null {
  if (!returns) return null;
  const numbers = [...returns.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((m) => parseFloat(m[1]));
  if (numbers.length === 0) return null;
  return Math.max(...numbers);
}

const SOURCE_RANK: Record<string, number> = {
  nse: 3,
  'sebi registry': 2,
  amfi: 1,
};

function sourceRank(source: string): number {
  return SOURCE_RANK[source.trim().toLowerCase()] ?? 0;
}

/**
 * Deterministic trending score derived only from API-provided signals:
 *  - `featured` flag returned by the API (strongest signal)
 *  - data source priority (live NSE listings > SEBI registry > AMFI NAV list)
 * Ties are broken by original array order at the call site (stable sort).
 */
export function trendingScore(listing: Listing): number {
  return (listing.featured ? 100 : 0) + sourceRank(listing.source) * 10;
}

/** Returns the top trending listings, deterministically ranked. */
export function getTrendingListings(listings: Listing[], count = 4): Listing[] {
  return listings
    .map((listing, index) => ({ listing, index }))
    .sort((a, b) => {
      const diff = trendingScore(b.listing) - trendingScore(a.listing);
      return diff !== 0 ? diff : a.index - b.index;
    })
    .slice(0, count)
    .map((entry) => entry.listing);
}

/** Marketplace filter categories with explicit alias matching (fixes naive substring bugs). */
export const MARKETPLACE_CATEGORIES = [
  'All',
  'Mutual Fund',
  'REITs',
  'SM REITs',
  'InvITs',
  'Category I AIF',
  'Category II AIF',
  'Category III AIF',
  'PMS',
  'Private Credit',
  'Corporate Bonds',
  'Structured Products',
  'Fractional Commercial Real Estate',
  'Gold',
] as const;

const CATEGORY_ALIASES: Record<Exclude<typeof MARKETPLACE_CATEGORIES[number], 'All'>, string[]> = {
  'Mutual Fund': ['mutual fund'],
  'REITs': ['reit', 'reits'],
  'SM REITs': ['sm reit', 'sm reits', 'small medium reit'],
  'InvITs': ['invit', 'invits', 'infrastructure investment trust'],
  'Category I AIF': ['category i aif'],
  'Category II AIF': ['category ii aif'],
  'Category III AIF': ['category iii aif'],
  'PMS': ['pms', 'portfolio management service'],
  'Private Credit': ['private credit'],
  'Corporate Bonds': ['corporate bond', 'corporate bonds', 'bond', 'bonds'],
  'Structured Products': ['structured product', 'structured products'],
  'Fractional Commercial Real Estate': ['fractional commercial real estate', 'fractional real estate', 'fractional cre'],
  'Gold': ['gold'],
};

/** Exact alias-based category matching. A listing matches exactly one filter bucket. */
export function matchesCategoryFilter(listingCategory: string, selected: string): boolean {
  if (selected === 'All') return true;
  const normalizedListing = listingCategory.trim().toLowerCase();
  const aliases = CATEGORY_ALIASES[selected as keyof typeof CATEGORY_ALIASES];
  if (!aliases) return normalizedListing === selected.toLowerCase();
  return aliases.includes(normalizedListing);
}

const SEARCH_FIELDS = ['name', 'provider', 'category', 'type', 'source', 'risk', 'horizon'] as const;

/** Full-dataset search across all relevant listing fields. */
export function searchListings(listings: Listing[], query: string): Listing[] {
  const q = query.trim().toLowerCase();
  if (!q) return listings;
  return listings.filter((listing) =>
    SEARCH_FIELDS.some((field) => String(listing[field] ?? '').toLowerCase().includes(q))
  );
}
