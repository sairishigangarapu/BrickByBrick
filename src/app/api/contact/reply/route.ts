import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    const adminUser = await currentUser();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, reply } = await request.json();

    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('clerk_id', clerkId)
      .single();

    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('contact_replies')
      .insert({
        message_id: messageId,
        admin_id: dbUser.id,
        reply,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('contact_messages')
      .update({ status: 'open' })
      .eq('id', messageId);

    if (updateError) {
      // Status update failed but reply was sent
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}