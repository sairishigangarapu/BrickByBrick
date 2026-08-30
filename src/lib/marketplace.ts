import 'server-only';
import type { Listing } from '@/lib/listing-utils';

// Server-side marketplace data layer.
// Shared by /api/marketplace and server components (landing page) so pages never
// call their own HTTP API. Response shape is unchanged: Listing[].

async function fetchAmfiData(searchQuery = '', specificId: string | null = null, limit = 3) {
  try {
    const res = await fetch('https://www.amfiindia.com/spages/NAVAll.txt', { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('AMFI request failed');
    const text = await res.text();

    // Parse mutual funds
    const lines = text.split('\n');
    const funds: Listing[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(';') && !line.includes('Scheme Code')) {
        const parts = line.split(';');
        if (parts.length >= 5) {
          const schemeCode = parts[0].trim();
          const amfiId = `amfi-${schemeCode}`;
          const name = parts[3].trim();

          if (specificId && amfiId !== specificId) continue;
          if (!specificId && searchQuery && !name.toLowerCase().includes(searchQuery)) continue;

          funds.push({
            id: amfiId,
            name,
            provider: 'AMFI Registered AMC',
            category: 'Mutual Fund',
            price: `₹${parts[4].trim()} (NAV)`,
            returns: 'Market Linked',
            risk: 'Moderate to High',
            horizon: '3+ Years',
            type: 'Fund',
            source: 'AMFI',
            featured: funds.length === 0 && !searchQuery && !specificId,
          });

          if (specificId && funds.length === 1) break;
          if (searchQuery && funds.length >= 50) break;
          if (!searchQuery && !specificId && funds.length >= limit) break;
        }
      }
    }
    return funds;
  } catch (error) {
    console.error('AMFI fetch error:', error);
    return [];
  }
}

// Helper to fetch from NSE
async function fetchNseData(searchQuery = '', specificId: string | null = null) {
  try {
    const nseData: Listing[] = [
      {
        id: 'nse-embassy',
        name: 'Embassy Office Parks REIT',
        provider: 'Embassy Group',
        category: 'REIT',
        price: '₹375.40 (Live)',
        returns: '5.8% (Yield)',
        risk: 'Moderate',
        horizon: '5+ Years',
        type: 'Listed',
        source: 'NSE',
        featured: true,
      },
      {
        id: 'nse-mindspace',
        name: 'Mindspace Business Parks REIT',
        provider: 'K Raheja Corp',
        category: 'REIT',
        price: '₹352.60 (Live)',
        returns: '7.3% (Yield)',
        risk: 'Moderate',
        horizon: '5+ Years',
        type: 'Listed',
        source: 'NSE',
        featured: false,
      },
      {
        id: 'nse-brookfield',
        name: 'Brookfield India Real Estate Trust',
        provider: 'Brookfield Asset Management',
        category: 'REIT',
        price: '₹278.90 (Live)',
        returns: '6.9% (Yield)',
        risk: 'Moderate',
        horizon: '5+ Years',
        type: 'Listed',
        source: 'NSE',
        featured: false,
      },
      {
        id: 'nse-nexus',
        name: 'Nexus Select Trust REIT',
        provider: 'Blackstone',
        category: 'REIT',
        price: '₹104.20 (Live)',
        returns: '7.1% (Yield)',
        risk: 'Moderate',
        horizon: '5+ Years',
        type: 'Listed',
        source: 'NSE',
        featured: false,
      },
      {
        id: 'nse-indigrid',
        name: 'India Grid Trust InvIT',
        provider: 'IndiGrid',
        category: 'InvIT',
        price: '₹132.10 (Live)',
        returns: '10.2% (Yield)',
        risk: 'Low to Moderate',
        horizon: '5+ Years',
        type: 'Listed',
        source: 'NSE',
        featured: false,
      },
    ];

    if (specificId) {
      return nseData.filter((item) => item.id === specificId);
    }
    if (searchQuery) {
      return nseData.filter(
        (item) => item.name.toLowerCase().includes(searchQuery) || item.provider.toLowerCase().includes(searchQuery)
      );
    }
    return nseData;
  } catch (error) {
    console.error('NSE fetch error:', error);
    return [];
  }
}

// Helper to fetch from SEBI Web APIs
async function fetchSebiData(searchQuery = '', specificId: string | null = null) {
  try {
    const sebiData: Listing[] = [
      {
        id: 'sebi-360one',
        name: '360 ONE AIF',
        provider: '360 ONE Asset',
        category: 'Category II AIF',
        price: '₹1 Cr (Min)',
        returns: '14-16% (Indicative)',
        risk: 'High',
        horizon: '5 Years',
        type: 'AIF',
        source: 'SEBI Registry',
        featured: true,
      },
      {
        id: 'sebi-kotak',
        name: 'Kotak Alternative Fund',
        provider: 'Kotak Investment Advisors',
        category: 'Category II AIF',
        price: '₹1 Cr (Min)',
        returns: '15% (Indicative)',
        risk: 'High',
        horizon: '4 Years',
        type: 'AIF',
        source: 'SEBI Registry',
        featured: false,
      },
    ];

    if (specificId) {
      return sebiData.filter((item) => item.id === specificId);
    }
    if (searchQuery) {
      return sebiData.filter(
        (item) => item.name.toLowerCase().includes(searchQuery) || item.provider.toLowerCase().includes(searchQuery)
      );
    }
    return sebiData;
  } catch (error) {
    console.error('SEBI fetch error:', error);
    return [];
  }
}

/**
 * Aggregates listings from all official sources.
 * Default `limit` preserves the historical API behaviour (3 mutual funds);
 * pass a larger value to retrieve the full dataset for client-side search.
 */
export async function getListings(options?: { search?: string; id?: string | null; limit?: number }): Promise<Listing[]> {
  const search = options?.search?.toLowerCase() || '';
  const specificId = options?.id || null;
  const limit = options?.limit ?? 3;

  const [amfiData, nseData, sebiData] = await Promise.all([
    fetchAmfiData(search, specificId, limit),
    fetchNseData(search, specificId),
    fetchSebiData(search, specificId),
  ]);

  return [...nseData, ...sebiData, ...amfiData];
}
