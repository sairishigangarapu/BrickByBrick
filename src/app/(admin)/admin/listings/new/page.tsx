import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { NewListingForm } from './NewListingForm';

export const dynamic = 'force-dynamic';

export default async function NewListingPage() {
  if (!supabaseAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-red-600 text-sm">
        Supabase is not configured.
      </div>
    );
  }

  const [{ data: categories }, { data: providers }] = await Promise.all([
    supabaseAdmin
      .from('investment_categories')
      .select('id, name')
      .order('name', { ascending: true }),
    supabaseAdmin
      .from('investment_providers')
      .select('id, name')
      .order('name', { ascending: true }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/listings"
          className="text-xs text-zinc-500 hover:text-zinc-900 uppercase tracking-widest font-bold"
        >
          ← All Listings
        </Link>
        <h1 className="text-2xl md:text-3xl font-black mt-2">Add New Listing</h1>
        <p className="text-zinc-500 text-sm">
          Listings are surfaced in the public marketplace once published.
        </p>
      </div>
      <NewListingForm
        categories={categories ?? []}
        providers={providers ?? []}
      />
    </div>
  );
}
