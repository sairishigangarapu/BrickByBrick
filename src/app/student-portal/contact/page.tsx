'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/server-supabase';
import ContactForm from '@/components/contact/ContactForm';

export default async function ContactPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = await getServerSupabase();

  const { data: user } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('clerk_id', userId)
    .single();

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-black mb-4">Contact Support</h1>
      <p className="text-gray-600 mb-8">Need help? Submit a ticket and we'll get back to you.</p>
      <div className="max-w-xl">
        <ContactForm 
          userId={userId} 
          userEmail={user?.email || ''} 
          userName={user?.full_name || ''} 
        />
      </div>
    </div>
  );
}