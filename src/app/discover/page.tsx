'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ArrowUpRight, Newspaper } from 'lucide-react';

import { ArticleCard } from '@/components/discover/ArticleCard';
import { NEWS_CATEGORIES, getNewsCategoryLabel, type NewsArticle } from '@/lib/news-categories';

type LoadState = 'loading' | 'ready' | 'error';

function formatPublishedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return '';
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return '';
  }
}

function ArticleListRow({ article }: { article: NewsArticle }) {
  const published = formatPublishedAt(article.publishedAt);
  const cleanDescription = article.description.replace(/<[^>]*>/g, '').trim();

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 px-3 py-4 -mx-3 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-orange-700 mb-1">
          {getNewsCategoryLabel(article.categoryId)}
        </p>
        <h3 className="font-bold text-[15px] leading-snug mb-1 line-clamp-2 group-hover:text-orange-700 transition-colors">
          {article.title}
        </h3>
        {cleanDescription && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-1 hidden sm:block">{cleanDescription}</p>
        )}
        <p className="text-[11px] text-gray-500 mt-1.5">
          <span className="font-semibold">{article.source}</span>
          {published && ` · ${published}`}
        </p>
      </div>
      <ArrowUpRight
        className="w-4 h-4 shrink-0 mt-1 text-gray-300 group-hover:text-orange-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        aria-hidden="true"
      />
    </a>
  );
}

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Full-topic preview feed powers the bento tiles (one fetch, cached).
  const [previews, setPreviews] = useState<NewsArticle[]>([]);
  const [previewState, setPreviewState] = useState<LoadState>('loading');

  // Selected feed powers the article list.
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [state, setState] = useState<LoadState>('loading');

  const loadPreviews = useCallback(async () => {
    setPreviewState('loading');
    try {
      const res = await fetch('/api/news?perCategory=2');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setPreviews(Array.isArray(data?.articles) ? data.articles : []);
      setPreviewState('ready');
    } catch (error) {
      console.error('Failed to fetch news previews:', error);
      setPreviewState('ready'); // Tiles degrade gracefully without previews.
    }
  }, []);

  const loadArticles = useCallback(async (category: string) => {
    setState('loading');
    try {
      const url =
        category !== 'all'
          ? `/api/news?category=${encodeURIComponent(category)}&perCategory=15`
          : '/api/news?perCategory=6';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setArticles(Array.isArray(data?.articles) ? data.articles : []);
      setState('ready');
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setState('error');
    }
  }, []);

  useEffect(() => {
    loadPreviews();
  }, [loadPreviews]);

  useEffect(() => {
    loadArticles(activeCategory);
  }, [activeCategory, loadArticles]);

  const previewFor = useCallback(
    (categoryId: string) => previews.find((article) => article.categoryId === categoryId),
    [previews]
  );

  const activeLabel = useMemo(
    () => (activeCategory === 'all' ? 'All Topics' : getNewsCategoryLabel(activeCategory)),
    [activeCategory]
  );

  const tileBase =
    'relative rounded-2xl border p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary group';
  const tileActive = 'bg-black text-white border-black shadow-md';
  const tileIdle = 'bg-white border-gray-200 hover:border-orange-400 hover:shadow-sm';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header band */}
      <div className="bg-black text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-2">Discover</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">Financial News & Insights</h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Curated market intelligence across alternative asset classes — REITs, InvITs, AIFs, private credit,
            bonds, and global markets.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Category Bento */}
        <section aria-label="News categories" className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

            {/* Featured tile — Markets */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'markets'}
              onClick={() => setActiveCategory('markets')}
              className={`${tileBase} md:col-span-2 md:row-span-2 min-h-[190px] flex flex-col ${
                activeCategory === 'markets' ? tileActive : tileIdle
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
                    activeCategory === 'markets' ? 'text-orange-400' : 'text-orange-600'
                  }`}
                >
                  Markets
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </div>
              <div className="mt-auto pt-4">
                {previewState === 'loading' ? (
                  <div className="space-y-2 animate-pulse" aria-busy="true">
                    <div className={`h-3.5 w-5/6 rounded ${activeCategory === 'markets' ? 'bg-zinc-800' : 'bg-gray-100'}`} />
                    <div className={`h-3.5 w-2/3 rounded ${activeCategory === 'markets' ? 'bg-zinc-800' : 'bg-gray-100'}`} />
                  </div>
                ) : (
                  <>
                    <p className={`font-bold text-sm leading-snug line-clamp-2 mb-1 ${activeCategory === 'markets' ? 'text-white' : 'text-gray-900'}`}>
                      {previewFor('markets')?.title ?? 'Live market headlines'}
                    </p>
                    {previewFor('markets') && (
                      <p className={`text-[11px] ${activeCategory === 'markets' ? 'text-zinc-400' : 'text-gray-500'}`}>
                        {previewFor('markets')!.source}
                        {formatPublishedAt(previewFor('markets')!.publishedAt) &&
                          ` · ${formatPublishedAt(previewFor('markets')!.publishedAt)}`}
                      </p>
                    )}
                  </>
                )}
              </div>
            </button>

            {/* All Topics */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={`${tileBase} sm:col-span-2 ${
                activeCategory === 'all' ? tileActive : tileIdle
              }`}
            >
              <span
                className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
                  activeCategory === 'all' ? 'text-orange-400' : 'text-orange-600'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" aria-hidden="true" /> All Topics
              </span>
              <p className={`text-sm mt-1 ${activeCategory === 'all' ? 'text-zinc-300' : 'text-gray-500'}`}>
                The complete feed, newest first
              </p>
            </button>

            {/* REITs */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'reits'}
              onClick={() => setActiveCategory('reits')}
              className={`${tileBase} ${activeCategory === 'reits' ? tileActive : tileIdle}`}
            >
              <span className={`text-xs font-black uppercase tracking-wider ${activeCategory === 'reits' ? 'text-orange-400' : 'text-orange-600'}`}>
                REITs
              </span>
              <p className={`text-xs mt-1 line-clamp-2 ${activeCategory === 'reits' ? 'text-zinc-400' : 'text-gray-500'}`}>
                {previewFor('reits')?.title ?? 'Listed real estate trusts'}
              </p>
            </button>

            {/* InvITs */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'invits'}
              onClick={() => setActiveCategory('invits')}
              className={`${tileBase} ${activeCategory === 'invits' ? tileActive : tileIdle}`}
            >
              <span className={`text-xs font-black uppercase tracking-wider ${activeCategory === 'invits' ? 'text-orange-400' : 'text-orange-600'}`}>
                InvITs
              </span>
              <p className={`text-xs mt-1 line-clamp-2 ${activeCategory === 'invits' ? 'text-zinc-400' : 'text-gray-500'}`}>
                {previewFor('invits')?.title ?? 'Infrastructure trusts & yield'}
              </p>
            </button>

            {/* AIFs */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'aifs'}
              onClick={() => setActiveCategory('aifs')}
              className={`${tileBase} ${activeCategory === 'aifs' ? tileActive : tileIdle}`}
            >
              <span className={`text-xs font-black uppercase tracking-wider ${activeCategory === 'aifs' ? 'text-orange-400' : 'text-orange-600'}`}>
                AIFs
              </span>
              <p className={`text-xs mt-1 line-clamp-2 ${activeCategory === 'aifs' ? 'text-zinc-400' : 'text-gray-500'}`}>
                {previewFor('aifs')?.title ?? 'Alternative investment funds'}
              </p>
            </button>

            {/* Private Credit */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'private-credit'}
              onClick={() => setActiveCategory('private-credit')}
              className={`${tileBase} ${activeCategory === 'private-credit' ? tileActive : tileIdle}`}
            >
              <span className={`text-xs font-black uppercase tracking-wider ${activeCategory === 'private-credit' ? 'text-orange-400' : 'text-orange-600'}`}>
                Private Credit
              </span>
              <p className={`text-xs mt-1 line-clamp-2 ${activeCategory === 'private-credit' ? 'text-zinc-400' : 'text-gray-500'}`}>
                {previewFor('private-credit')?.title ?? 'Direct lending & debt funds'}
              </p>
            </button>

            {/* Bonds */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'bonds'}
              onClick={() => setActiveCategory('bonds')}
              className={`${tileBase} sm:col-span-2 ${activeCategory === 'bonds' ? tileActive : tileIdle}`}
            >
              <span className={`text-xs font-black uppercase tracking-wider ${activeCategory === 'bonds' ? 'text-orange-400' : 'text-orange-600'}`}>
                Bonds
              </span>
              <p className={`text-xs mt-1 line-clamp-2 ${activeCategory === 'bonds' ? 'text-zinc-400' : 'text-gray-500'}`}>
                {previewFor('bonds')?.title ?? 'Corporate bonds & fixed income'}
              </p>
            </button>

            {/* Regulations */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'regulations'}
              onClick={() => setActiveCategory('regulations')}
              className={`${tileBase} sm:col-span-2 ${activeCategory === 'regulations' ? tileActive : tileIdle}`}
            >
              <span className={`text-xs font-black uppercase tracking-wider ${activeCategory === 'regulations' ? 'text-orange-400' : 'text-orange-600'}`}>
                Regulations
              </span>
              <p className={`text-xs mt-1 line-clamp-2 ${activeCategory === 'regulations' ? 'text-zinc-400' : 'text-gray-500'}`}>
                {previewFor('regulations')?.title ?? 'SEBI & market rules'}
              </p>
            </button>

            {/* Global Alternatives */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'global-alternatives'}
              onClick={() => setActiveCategory('global-alternatives')}
              className={`${tileBase} sm:col-span-2 ${activeCategory === 'global-alternatives' ? tileActive : tileIdle}`}
            >
              <span className={`text-xs font-black uppercase tracking-wider ${activeCategory === 'global-alternatives' ? 'text-orange-400' : 'text-orange-600'}`}>
                Global Alternatives
              </span>
              <p className={`text-xs mt-1 line-clamp-2 ${activeCategory === 'global-alternatives' ? 'text-zinc-400' : 'text-gray-500'}`}>
                {previewFor('global-alternatives')?.title ?? 'Worldwide private markets'}
              </p>
            </button>

          </div>
        </section>

        {/* Article list */}
        <section aria-label="News articles" aria-busy={state === 'loading'}>
          <div className="flex items-center justify-between mb-3 px-3">
            <h2 className="text-sm font-black uppercase tracking-wider">
              {state === 'loading' ? 'Loading articles...' : `${articles.length} article${articles.length === 1 ? '' : 's'} · ${activeLabel}`}
            </h2>
            {activeCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="text-xs font-bold uppercase tracking-wide text-orange-600 hover:underline"
              >
                View all topics
              </button>
            )}
          </div>

          {/* Loading skeleton rows */}
          {state === 'loading' && (
            <div className="bg-white rounded-2xl border border-gray-200 px-3 py-2 divide-y divide-gray-100 animate-pulse" aria-busy="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="py-4">
                  <div className="h-3 w-20 bg-gray-100 rounded-full mb-2.5" />
                  <div className="h-4 w-full bg-gray-100 rounded mb-1.5" />
                  <div className="h-4 w-2/3 bg-gray-100 rounded mb-2" />
                  <div className="h-2.5 w-32 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
              <Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-3" aria-hidden="true" />
              <p className="font-bold text-lg mb-1">Couldn&apos;t load the latest news</p>
              <p className="text-gray-500 text-sm mb-6">The news service may be temporarily unavailable. Please try again.</p>
              <button
                type="button"
                onClick={() => loadArticles(activeCategory)}
                className="bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {state === 'ready' && articles.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-3" aria-hidden="true" />
              <p className="font-bold text-lg mb-1">No articles right now</p>
              <p className="text-gray-500 text-sm mb-6">
                Nothing has been published in this topic recently. Check another category or try again later.
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="border-2 border-gray-200 hover:border-gray-800 font-bold py-2.5 px-6 rounded-lg transition-colors text-sm"
              >
                Browse all topics
              </button>
            </div>
          )}

          {/* Articles — list layout */}
          {state === 'ready' && articles.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 px-3 py-2 divide-y divide-gray-100">
              {articles.map((article) => (
                <ArticleListRow key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* Card grid for the selected topic (visual complement to the list) */}
        {state === 'ready' && articles.length > 3 && (
          <section className="mt-10" aria-label="Top stories grid">
            <h2 className="text-sm font-black uppercase tracking-wider mb-4 px-1">Top Stories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.slice(0, 6).map((article) => (
                <ArticleCard key={`card-${article.id}`} article={article} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer note */}
      <footer className="border-t border-gray-200 bg-white py-6 px-6">
        <p className="max-w-7xl mx-auto text-xs text-gray-500">
          News headlines are aggregated from public Google News feeds for informational purposes only and do not
          constitute investment advice. BrickByBrick is an education and discovery platform.
        </p>
      </footer>
    </div>
  );
}
