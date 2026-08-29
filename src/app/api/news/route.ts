import { NextResponse } from 'next/server';
import { getNewsArticles } from '@/lib/news';

// Feed caching is handled in src/lib/news.ts (only non-empty results are
// cached), so this route stays dynamic and always reflects fresh feed state.

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;

    const perCategoryParam = Number(url.searchParams.get('perCategory'));
    const perCategory =
      Number.isFinite(perCategoryParam) && perCategoryParam > 0 ? Math.min(perCategoryParam, 30) : undefined;

    const articles = await getNewsArticles({ category, perCategory });

    return NextResponse.json(
      { articles },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('News aggregation error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
