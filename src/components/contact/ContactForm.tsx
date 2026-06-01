'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ContactFormProps {
  userId: string | null;
  userEmail: string;
  userName: string;
}

export default function ContactForm({ userId, userEmail, userName }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, userId, userEmail, userName }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit ticket');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
        <div className="text-green-600 text-4xl mb-2">✓</div>
        <h3 className="text-lg font-semibold text-green-800">Ticket Submitted!</h3>
        <p className="text-green-700 mt-2">We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 border border-gray-200">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <Input name="subject" required placeholder="What do you need help with?" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          name="message"
          required
          className="w-full border border-gray-200 p-3 h-32 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          placeholder="Describe your issue in detail..."
        ></textarea>
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
      </Button>
    </form>
  );
}