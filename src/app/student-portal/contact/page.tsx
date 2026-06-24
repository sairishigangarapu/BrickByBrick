'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import ContactForm from '@/components/contact/ContactForm';

export default async function ContactPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name')
    .eq('clerk_id', userId)
    .single();

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-black mb-4">Contact Support</h1>
      <p className="text-gray-600 mb-8">Need help? Submit a ticket and we'll get back to you.</p>

      <div className="max-w-xl mb-8 p-6 bg-white border border-gray-200 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
        <div>
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">Direct Email</h3>
          <a href="mailto:connect.brickbybrick@gmail.com" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
            connect.brickbybrick@gmail.com
          </a>
        </div>
        <div className="flex gap-4">
          <a href="https://www.instagram.com/_brick_by.brick_/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider">
            Instagram
          </a>
          <a href="https://www.linkedin.com/company/brickbybrick-sip/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider">
            LinkedIn
          </a>
        </div>
      </div>
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