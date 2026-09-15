'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { WaitlistForm } from '@/components/public/WaitlistForm';

export default function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('bbb_waitlist_submitted') === 'true') {
        setSubmitted(true);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-black mb-3">Join the Waitlist</h1>
        <p className="text-zinc-600 mb-8 max-w-xl">
          Get early access to the WelNex alternative investment marketplace. We will share platform updates,
          new asset classes, and learning content as we ship.
        </p>

        <Card>
          <CardContent className="p-6">
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-6 text-sm">
                <p className="font-bold mb-1">You are on the list.</p>
                <p>Early access updates will arrive by email.</p>
              </div>
            ) : (
              <WaitlistForm />
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-zinc-500 mt-6 text-center max-w-md mx-auto">
          We will not share your contact details. You can unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}
