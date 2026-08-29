// Client-safe news configuration shared by the /api/news route,
// the Discover page, and landing-page previews.

export interface NewsCategory {
  id: string;
  label: string;
  /** Search query used for the underlying news feed. */
  query: string;
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
