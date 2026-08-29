import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

function formatAmount(v: number | string | null) {
  if (v == null) return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return String(v);
  return `₹${n.toLocaleString('en-IN')}`;
}

function formatPercent(v: number | string | null) {
  if (v == null) return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return String(v);
  return `${n}%`;
}

export default async function AdminListingDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  if (!supabaseAdmin) notFound();

  const { data: listing, error } = await supabaseAdmin
    .from('investment_listings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !listing) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/listings"
          className="text-xs text-zinc-500 hover:text-zinc-900 uppercase tracking-widest font-bold"
        >
          ← All Listings
        </Link>
        <h1 className="text-2xl md:text-3xl font-black mt-2">{listing.name}</h1>
        <p className="text-zinc-500 text-sm">
          {listing.is_published ? 'Published' : 'Draft'}
          {listing.is_featured ? ' · Featured' : ''}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Stat label="Minimum Investment" value={formatAmount(listing.minimum_investment)} />
        <Stat label="Expected Returns" value={formatPercent(listing.expected_returns)} />
        <Stat label="Risk Level" value={listing.risk_level ?? '—'} />
        <Stat label="Liquidity" value={listing.liquidity ?? '—'} />
        <Stat label="Investment Horizon" value={listing.investment_horizon ?? '—'} />
        <Stat label="Asset Class" value={listing.asset_class ?? '—'} />
      </div>

      {listing.description && (
        <section className="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 className="text-base font-black uppercase tracking-wider mb-3">Description</h2>
          <div
            className="prose prose-sm max-w-none text-zinc-700"
            // Description is author-controlled; allow simple HTML rendering.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: listing.description }}
          />
        </section>
      )}

      {listing.fee_structure && (
        <section className="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 className="text-base font-black uppercase tracking-wider mb-2">Fee Structure</h2>
          <div
            className="prose prose-sm max-w-none text-zinc-700"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: listing.fee_structure }}
          />
        </section>
      )}

      <div className="flex gap-3">
        <Link
          href={`/listing/${listing.id}`}
          className="inline-flex items-center justify-center h-11 px-5 border border-zinc-300 font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-zinc-50"
        >
          View public page
        </Link>
        <Link
          href={`/compare?id=${listing.id}`}
          className="inline-flex items-center justify-center h-11 px-5 border border-zinc-300 font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-zinc-50"
        >
          View in compare
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
      <p className="font-bold text-zinc-900">{value}</p>
    </div>
  );
}
