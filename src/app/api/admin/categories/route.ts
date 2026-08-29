import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

const VALID_TYPES = new Set(['primary', 'sub', 'niche']);

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
    .from('investment_categories')
    .select('id, name, parent_category_id, is_root, category_type, is_active, order_index, created_at')
    .order('order_index', { ascending: true });

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

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const categoryType = typeof body.category_type === 'string' ? body.category_type : 'primary';
  if (!VALID_TYPES.has(categoryType)) {
    return NextResponse.json({ error: 'Invalid category_type' }, { status: 400 });
  }

  const parentCategoryId = typeof body.parent_category_id === 'string' ? body.parent_category_id : null;

  const { data, error } = await supabaseAdmin
    .from('investment_categories')
    .insert({
      name,
      parent_category_id: parentCategoryId,
      is_root: !parentCategoryId,
      category_type: categoryType,
      is_active: true,
      order_index: typeof body.order_index === 'number' ? body.order_index : 0,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ row: data });
}
