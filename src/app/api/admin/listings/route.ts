import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

const VALID_RISK = new Set(['low', 'medium', 'high', 'very_high']);
const VALID_LIQUIDITY = new Set(['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'lock_in']);

function sanitizePayload(input: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (typeof input.name === 'string' && input.name.trim()) {
    out.name = input.name.trim();
  }
  if (typeof input.description === 'string') out.description = input.description;
  if (typeof input.category_id === 'string' && input.category_id) out.category_id = input.category_id;
  if (typeof input.provider_id === 'string' && input.provider_id) out.provider_id = input.provider_id;
  if (typeof input.minimum_investment === 'number' && Number.isFinite(input.minimum_investment)) {
    out.minimum_investment = input.minimum_investment;
  }
  if (typeof input.expected_returns === 'number' && Number.isFinite(input.expected_returns)) {
    out.expected_returns = input.expected_returns;
  }
  if (typeof input.risk_level === 'string' && VALID_RISK.has(input.risk_level)) {
    out.risk_level = input.risk_level;
  }
  if (typeof input.liquidity === 'string' && VALID_LIQUIDITY.has(input.liquidity)) {
    out.liquidity = input.liquidity;
  }
  if (typeof input.investment_horizon === 'string') out.investment_horizon = input.investment_horizon;
  if (typeof input.fee_structure === 'string') out.fee_structure = input.fee_structure;
  if (typeof input.taxation === 'string') out.taxation = input.taxation;
  if (typeof input.logo_url === 'string') out.logo_url = input.logo_url;
  if (typeof input.banner_url === 'string') out.banner_url = input.banner_url;
  if (typeof input.is_published === 'boolean') out.is_published = input.is_published;
  if (typeof input.is_featured === 'boolean') out.is_featured = input.is_featured;
  if (typeof input.is_trending === 'boolean') out.is_trending = input.is_trending;
  return out;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from('investment_listings')
    .select(
      'id, name, category_id, provider_id, is_published, is_featured, is_trending, minimum_investment, expected_returns, risk_level, liquidity, created_at, updated_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload = sanitizePayload(body);
  if (!payload.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('investment_listings')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ row: data });
}
