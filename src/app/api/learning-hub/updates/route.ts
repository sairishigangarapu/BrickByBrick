import { NextResponse } from 'next/server';
import { getHubUpdates } from '@/lib/news';

// Feed caching is handled in src/lib/news.ts (only non-empty results are
// cached), so this route stays dynamic and always reflects fresh feed state.

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const perSectionParam = Number(url.searchParams.get('perSection'));
    const perSection =
      Number.isFinite(perSectionParam) && perSectionParam > 0 ? Math.min(perSectionParam, 30) : 4;

    const sections = await getHubUpdates(perSection);

    return NextResponse.json(
      { sections },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Learning hub updates error:', error);
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}
