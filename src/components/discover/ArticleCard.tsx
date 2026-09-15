'use client';

import React, { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  Building2,
  Globe2,
  Handshake,
  LineChart,
  Scale,
  ScrollText,
  TrendingUp,
  Zap,
} from 'lucide-react';

import type { NewsArticle } from '@/lib/news-categories';
import { getNewsCategoryLabel } from '@/lib/news-categories';

const CATEGORY_STYLES: Record<string, { icon: React.ElementType; tile: string; badge: string }> = {
  reits: { icon: Building2, tile: 'from-rose-100 to-rose-50 text-rose-700', badge: 'bg-rose-100 text-rose-800' },
  invits: { icon: Zap, tile: 'from-orange-100 to-orange-50 text-orange-700', badge: 'bg-orange-100 text-orange-800' },
  aifs: { icon: TrendingUp, tile: 'from-violet-100 to-violet-50 text-violet-700', badge: 'bg-violet-100 text-violet-800' },
  'private-credit': { icon: Handshake, tile: 'from-emerald-100 to-emerald-50 text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  bonds: { icon: ScrollText, tile: 'from-teal-100 to-teal-50 text-teal-700', badge: 'bg-teal-100 text-teal-800' },
  markets: { icon: LineChart, tile: 'from-blue-100 to-blue-50 text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  regulations: { icon: Scale, tile: 'from-amber-100 to-amber-50 text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  'global-alternatives': { icon: Globe2, tile: 'from-sky-100 to-sky-50 text-sky-700', badge: 'bg-sky-100 text-sky-800' },
};

function formatPublishedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return '';
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return '';
  }
}

export function ArticleCard({ article }: { article: NewsArticle }) {
  const [imageFailed, setImageFailed] = useState(false);
  // The aggregated feed currently provides no thumbnails; when one becomes
  // available it renders here and gracefully falls back to the branded tile.
  const imageUrl = (article as NewsArticle & { imageUrl?: string }).imageUrl;
  const showImage = Boolean(imageUrl) && !imageFailed;

  const style = CATEGORY_STYLES[article.categoryId] ?? CATEGORY_STYLES.markets;
  const Icon = style.icon;
  const published = formatPublishedAt(article.publishedAt);
  // Defense-in-depth: never render residual markup from the feed.
  const cleanDescription = article.description.replace(/<[^>]*>/g, '').trim();

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-lg hover:border-gray-300 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
    >
      {/* Image / branded placeholder */}
      <div className={`relative aspect-[16/9] bg-gradient-to-br ${style.tile} flex items-center justify-center overflow-hidden`}>
        {showImage ? (
          <img
            src={imageUrl as string}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <>
            <Icon
              className="w-10 h-10 stroke-[1.5px] opacity-70 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            />
            <span className="absolute bottom-2 left-3 text-[10px] font-black uppercase tracking-widest opacity-60">
              WelNex Markets
            </span>
          </>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mb-2.5 ${style.badge}`}>
          {getNewsCategoryLabel(article.categoryId)}
        </span>

        <h3 className="font-bold text-[15px] leading-snug mb-1.5 line-clamp-2 group-hover:text-orange-700 transition-colors">
          {article.title}
        </h3>
        {cleanDescription && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{cleanDescription}</p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-[11px] text-gray-500">
          <span className="font-semibold truncate">{article.source}</span>
          {published && <time dateTime={article.publishedAt} className="shrink-0">{published}</time>}
        </div>
      </div>
    </a>
  );
}
