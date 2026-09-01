// Client-safe news configuration shared by the /api/news route,
// the Discover page, and landing-page previews.

export interface NewsCategory {
  id: string;
  label: string;
  /** Search query used for the underlying news feed. */
  query: string;
  /**
   * Where the articles come from. 'google-news' (default) uses the Google News
   * RSS pipeline in src/lib/news.ts; 'sebi' uses SEBI's official RSS feed.
   */
  source?: 'google-news' | 'sebi';
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO date
  description: string;
  categoryId: string;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  { id: 'reits', label: 'REITs', query: 'REITs India real estate investment trust' },
  { id: 'invits', label: 'InvITs', query: 'InvITs India infrastructure investment trust' },
  { id: 'aifs', label: 'AIFs', query: 'alternative investment funds India AIF' },
  { id: 'private-credit', label: 'Private Credit', query: 'private credit India debt funds lending' },
  { id: 'bonds', label: 'Bonds', query: 'bonds India corporate bonds debt market yields' },
  { id: 'markets', label: 'Markets', query: 'Indian stock market Sensex Nifty' },
  { id: 'regulations', label: 'Regulations', query: 'SEBI regulation India securities market rules' },
  { id: 'global-alternatives', label: 'Global Alternatives', query: 'private equity hedge funds' },
];

export function getNewsCategoryLabel(id: string): string {
  return NEWS_CATEGORIES.find((category) => category.id === id)?.label ?? 'Markets';
}

// Sections for the Learning Hub "Research Hub" cards. Each maps to a verified,
// free feed: official SEBI RSS (sebi.gov.in/sebirss.xml) for regulatory
// updates, Google News RSS for market reports and tax news.
export const HUB_SECTIONS: NewsCategory[] = [
  {
    id: 'market-reports',
    label: 'Market Reports',
    query: 'India alternative investments market report REIT AIF quarterly',
  },
  {
    id: 'sebi-updates',
    label: 'SEBI Updates',
    query: 'SEBI',
    source: 'sebi',
  },
  {
    id: 'tax-updates',
    label: 'Tax Updates',
    query: 'India income tax GST capital gains investor tax rules changes',
  },
];

/**
 * Pick the most relevant news category id for a given listing. Used by the
 * asset details page to render the Recent News section without inventing
 * a new data pipeline.
 */
export function pickCategoryIdForListing(listing: { category: string; type: string }): string {
  const c = listing.category.toLowerCase();
  if (c.includes('reit')) return 'reits';
  if (c.includes('invit')) return 'invits';
  if (
    c.includes('aif') ||
    c.includes('category i') ||
    c.includes('category ii') ||
    c.includes('category iii')
  ) {
    return 'aifs';
  }
  if (c.includes('private credit') || c.includes('mezzanine')) return 'private-credit';
  if (c.includes('bond')) return 'bonds';
  if (c.includes('mutual fund')) return 'markets';
  if (c.includes('pms')) return 'markets';
  if (c.includes('global')) return 'global-alternatives';
  return 'markets';
}
