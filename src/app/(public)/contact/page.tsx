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

          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">Direct Email</h3>
              <a href="mailto:connect.welnex@gmail.com" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                connect.welnex@gmail.com
              </a>
            </div>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/_brick_by.brick_/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider">
                Instagram
              </a>
              <a href="https://www.linkedin.com/company/welnex-sip/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider">
                LinkedIn
              </a>
            </div>
          </div>
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