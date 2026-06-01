'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

export async function updateUserRole(userId: string, role: string) {
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

  if (user?.clerk_id && CLERK_SECRET_KEY) {
    try {
      const response = await fetch(`https://api.clerk.com/v1/users/${user.clerk_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          public_metadata: { role },
        }),
      });
      
      const responseBody = await response.text();
      
      if (!response.ok) {
        // Clerk sync failed
      }
    } catch (e) {
      // Failed to sync role to Clerk
    }
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
}