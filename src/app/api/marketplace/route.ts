import { NextResponse } from 'next/server';
import { getListings } from '@/lib/marketplace';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const id = url.searchParams.get('id');

    // `limit` lets the marketplace request the full dataset for client-side
    // search/filtering. Defaults preserve the original response behaviour.
    const limitParam = Number(url.searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 1000) : undefined;

    const allListings = await getListings({ search, id, limit });

    return NextResponse.json(allListings, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Aggregation error:', error);
    return NextResponse.json({ error: 'Failed to fetch official market data' }, { status: 500 });
  }
}
