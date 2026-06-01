import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import nodemailer from 'nodemailer';

const ADMIN_EMAIL = 'connect.brickbybrick@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'connect.brickbybrick@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { subject, message, userId, userEmail, userName } = await request.json();

    let userDbId: string | null = null;

    if (userId) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();
      
      userDbId = user?.id || null;
    }

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        user_id: userDbId,
        subject,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await transporter.sendMail({
        from: 'BrickByBrick <connect.brickbybrick@gmail.com>',
        to: ADMIN_EMAIL,
        subject: `Contact: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${userName || 'Guest'}</p>
          <p><strong>Email:</strong> ${userEmail || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });
    } catch (emailError) {
      // Email sending failed but message was saved
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}