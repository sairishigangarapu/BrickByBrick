import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const params = await Promise.resolve(context.params);
  const id = params.id;

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.is_active === 'boolean') update.is_active = body.is_active;
  if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim();
  if (typeof body.order_index === 'number') update.order_index = body.order_index;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('investment_categories')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ row: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const params = await Promise.resolve(context.params);
  const id = params.id;

  // Check for children first to give a clear error
  const { count: childCount } = await supabaseAdmin
    .from('investment_categories')
    .select('id', { count: 'exact', head: true })
    .eq('parent_category_id', id);

  if ((childCount ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Cannot delete a category with subcategories. Remove or reparent the subcategories first.' },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin.from('investment_categories').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
