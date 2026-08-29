'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';

const VALID_ROLES = new Set(['user', 'admin', 'investment_provider', 'accredited_investor']);

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();

  if (!VALID_ROLES.has(role)) {
    throw new Error('Invalid role.');
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('clerk_id')
    .eq('id', userId)
    .single();

  const { error } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to update user role');
  }

  if (user?.clerk_id && process.env.CLERK_SECRET_KEY) {
    try {
      const response = await fetch(`https://api.clerk.com/v1/users/${user.clerk_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          public_metadata: { role },
        }),
      });

      if (!response.ok) {
        if (process.env.NODE_ENV !== 'production') {
          const body = await response.text();
          console.error('[updateUserRole] Clerk sync failed:', response.status, body);
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[updateUserRole] Clerk sync threw:', e);
      }
    }
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
}

export async function adjustUserXPAction(userId: string, delta: number) {
  await requireAdmin();

  if (!Number.isFinite(delta)) {
    throw new Error('Invalid XP delta.');
  }

  const { data: u } = await supabaseAdmin
    .from('users')
    .select('xp')
    .eq('id', userId)
    .single();

  const currentXP = u?.xp ?? 0;
  const newXP = Math.max(0, currentXP + Math.round(delta));
  const newLevel = computeLevel(newXP);

  const { error } = await supabaseAdmin
    .from('users')
    .update({ xp: newXP, level: newLevel })
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to update XP');
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
}

const LEVELS: Array<{ level: number; xpRequired: number }> = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 50 },
  { level: 3, xpRequired: 120 },
  { level: 4, xpRequired: 200 },
  { level: 5, xpRequired: 300 },
];

function computeLevel(xp: number): number {
  let level = 1;
  for (const entry of LEVELS) {
    if (xp >= entry.xpRequired) {
      level = entry.level;
    }
  }
  return level;
}
