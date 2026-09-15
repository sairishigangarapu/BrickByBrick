import { getLatestNews, getNewsByCategory } from '@/lib/news';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
import DiscoverClient from './DiscoverClient';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function DiscoverPage({ searchParams }: Props) {
  const { category = 'all' } = await searchParams;

  const [previews, articles] = await Promise.all([
    getLatestNews(NEWS_CATEGORIES.length * 2),
    category !== 'all'
      ? getNewsByCategory(category, 15)
      : getLatestNews(6),
  ]);

  return (
    <DiscoverClient
      initialPreviews={previews}
      initialArticles={articles}
      initialCategory={category}
    />
  );
}
