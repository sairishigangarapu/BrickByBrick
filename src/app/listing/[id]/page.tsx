import { notFound } from 'next/navigation';

import { getListings } from '@/lib/marketplace';
import { getNewsArticles } from '@/lib/news';
import { pickCategoryIdForListing, type NewsArticle } from '@/lib/news-categories';

import { AssetDetailsContent } from './AssetDetailsContent';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function AssetDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  let listings: Awaited<ReturnType<typeof getListings>> = [];
  try {
    listings = await getListings({ id });
  } catch (error) {
    console.error('[AssetDetails] Failed to load listing:', error);
  }

  if (!listings || listings.length === 0) {
    notFound();
  }

  const listing = listings[0];

  let relatedNews: NewsArticle[] = [];
  try {
    const categoryId = pickCategoryIdForListing(listing);
    relatedNews = await getNewsArticles({ category: categoryId, perCategory: 6 });
  } catch (error) {
    console.error('[AssetDetails] Failed to load related news:', error);
  }

  return <AssetDetailsContent listing={listing} relatedNews={relatedNews} />;
}
