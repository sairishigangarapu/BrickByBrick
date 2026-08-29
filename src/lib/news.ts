import 'server-only';
import { NEWS_CATEGORIES, type NewsArticle, type NewsCategory } from '@/lib/news-categories';

export { NEWS_CATEGORIES } from '@/lib/news-categories';
export type { NewsArticle, NewsCategory } from '@/lib/news-categories';

// Server-side news data layer for the Discover section.
// Aggregates Google News RSS (keyless, free) per financial topic and tags each
// article with its investment/financial category at fetch time — deterministic,
// reproducible categorization with no arbitrary ranking.

const FEED_TIMEOUT_MS = 10000;
const ARTICLES_PER_CATEGORY_DEFAULT = 8;
// Google News throttles bursts of concurrent requests from one IP, which made
// most topics return empty. Fetch in small batches with retries and backoff.
const FEED_CONCURRENCY = 2;
const FEED_RETRIES = 2;
const FEED_RETRY_DELAYS_MS = [800, 1600];

function decodeEntities(input: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    ndash: '–',
    mdash: '—',
    rsquo: '\u2019',
    lsquo: '\u2018',
    ldquo: '\u201c',
    rdquo: '\u201d',
    hellip: '…',
  };
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => named[name] ?? match);
}

function stripHtml(input: string): string {
  // Decode entities FIRST (Google News escapes its markup, sometimes twice —
  // e.g. "&amp;nbsp;"), then strip tags. Repeat decoding until stable so
  // double-escaped entities never leak into the UI.
  let decoded = decodeEntities(input);
  for (let i = 0; i < 3; i++) {
    const next = decodeEntities(decoded);
    if (next === decoded) break;
    decoded = next;
  }
  return decoded
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!match) return '';
  let value = match[1].trim();
  const cdata = value.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdata) value = cdata[1].trim();
  return value;
}

interface RawItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
}

function parseRssItems(xml: string): RawItem[] {
  const items: RawItem[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const itemMatch of itemMatches) {
    const block = itemMatch[1];
    const title = stripHtml(extractTag(block, 'title'));
    const link = stripHtml(extractTag(block, 'link'));
    if (!title || !link) continue;

    const sourceMatch = block.match(/<source(?:\s[^>]*)?>([\s\S]*?)<\/source>/i);
    items.push({
      title,
      link,
      pubDate: stripHtml(extractTag(block, 'pubDate')),
      source: sourceMatch ? stripHtml(sourceMatch[1]) : 'Google News',
      description: stripHtml(extractTag(block, 'description')),
    });
  }
  return items;
}

// Module-level feed cache. Unlike Next's fetch cache, empty/throttled
// responses are never stored — retries always hit the live endpoint.
const feedCache = new Map<string, { expires: number; articles: NewsArticle[] }>();
const FEED_CACHE_TTL_MS = 15 * 60 * 1000;

async function fetchCategoryArticles(category: NewsCategory, limit: number): Promise<NewsArticle[]> {
  const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(category.query)}&hl=en-IN&gl=IN&ceid=IN:en`;

  const cached = feedCache.get(feedUrl);
  if (cached && cached.expires > Date.now()) return cached.articles.slice(0, limit);

  for (let attempt = 0; attempt <= FEED_RETRIES; attempt++) {
    try {
      const res = await fetch(feedUrl, {
        cache: 'no-store', // never persist throttled/empty responses
        signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
      const xml = await res.text();

      const articles: NewsArticle[] = parseRssItems(xml)
        .slice(0, limit)
        .map((item, index) => {
          const parsedDate = item.pubDate ? new Date(item.pubDate) : null;
          const publishedAt =
            parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : new Date(0).toISOString();
          return {
            // Stable id derived from the article URL.
            id: `${category.id}-${index}-${Buffer.from(item.link).toString('base64url').slice(0, 24)}`,
            title: item.title,
            url: item.link,
            source: item.source,
            publishedAt,
            description: item.description,
            categoryId: category.id,
          };
        });
      if (articles.length > 0) {
        feedCache.set(feedUrl, { expires: Date.now() + FEED_CACHE_TTL_MS, articles });
        return articles;
      }
      if (attempt === FEED_RETRIES) return [];
    } catch (error) {
      console.error(
        `News feed error [${category.id}] attempt ${attempt + 1}:`,
        error instanceof Error ? error.message : error
      );
      if (attempt === FEED_RETRIES) return []; // A single unavailable topic never breaks the whole section.
    }
    await new Promise((resolve) => setTimeout(resolve, FEED_RETRY_DELAYS_MS[Math.min(attempt, FEED_RETRY_DELAYS_MS.length - 1)]));
  }
  return [];
}

/** Runs async work over the list with bounded concurrency, preserving order. */
async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

export interface GetNewsOptions {
  /** Category id to fetch a single topic; omit for all topics. */
  category?: string;
  perCategory?: number;
}

/** Fetches categorized articles. Sorted newest-first, deduplicated by title. */
export async function getNewsArticles(options?: GetNewsOptions): Promise<NewsArticle[]> {
  const perCategory = options?.perCategory ?? ARTICLES_PER_CATEGORY_DEFAULT;

  const categories =
    options?.category != null
      ? NEWS_CATEGORIES.filter((category) => category.id === options.category)
      : NEWS_CATEGORIES;

  if (categories.length === 0) return [];

  const results = await mapWithConcurrency(categories, FEED_CONCURRENCY, (category) =>
    fetchCategoryArticles(category, perCategory)
  );

  const seenTitles = new Set<string>();
  const articles: NewsArticle[] = [];
  for (const group of results) {
    for (const article of group) {
      const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenTitles.has(key)) continue;
      seenTitles.add(key);
      articles.push(article);
    }
  }

  return articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Convenience helper for compact previews (landing page). */
export async function getLatestNews(count: number): Promise<NewsArticle[]> {
  const articles = await getNewsArticles({ perCategory: 4 });
  return articles.slice(0, count);
}
