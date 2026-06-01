'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import ContactForm from '@/components/contact/ContactForm';

export default async function ContactPage() {
  const { userId } = await auth();
  let user = null;
  let dbUser = null;

  if (userId) {
    user = await currentUser();
    
    if (user) {
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name')
        .eq('clerk_id', userId)
        .single();
      
      dbUser = existing;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black mb-4">Contact Us</h1>
          <p className="text-gray-600 mb-8">
            Have a question or need help? Send us a message and we'll get back to you.
          </p>
          <ContactForm 
            userId={userId} 
            userEmail={dbUser?.email || user?.primaryEmailAddress?.emailAddress || ''}
            userName={dbUser?.full_name || user?.fullName || ''}
          />
        </div>
      </div>
    </div>
  );
}