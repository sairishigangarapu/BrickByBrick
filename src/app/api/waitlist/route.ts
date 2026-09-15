import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type WaitlistPayload = {
  name: string;
  email: string;
  source?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePayload(payload: Partial<WaitlistPayload>) {
  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim().toLowerCase();
  const source = (payload.source || 'welnex-waitlist').trim();

  if (!name || name.length < 2) {
    return { error: 'Please provide a valid name.' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Please provide a valid email address.' };
  }

  return { data: { name, email, source } };
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Database connection not configured.' },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as Partial<WaitlistPayload>;
    const validation = validatePayload(body);

    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin
      .from('waitlist')
      .insert([{
        name: validation.data.name,
        email: validation.data.email,
        source: validation.data.source,
      }]);

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You are already on the waitlist!' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Could not join the waitlist. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request. Please try again.' },
      { status: 400 }
    );
  }
}
