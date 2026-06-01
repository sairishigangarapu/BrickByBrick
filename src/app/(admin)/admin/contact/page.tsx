import React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import AdminContactClient from '@/components/contact/AdminContactClient';

export default async function AdminContactPage() {
  const { data: messages } = await supabaseAdmin
    .from('contact_messages')
    .select(`
      id,
      subject,
      message,
      status,
      created_at,
      users ( email, full_name ),
      contact_replies ( reply, created_at )
    `)
    .order('created_at', { ascending: false });

  return <AdminContactClient initialMessages={messages || []} />;
}