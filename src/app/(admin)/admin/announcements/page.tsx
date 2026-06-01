import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { revalidatePath } from 'next/cache';

export default async function AdminAnnouncementsPage() {
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  async function postAnnouncement(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (title && content) {
      await supabase.from('announcements').insert({ title, content });
      revalidatePath('/admin/announcements');
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-black mb-8">Create Broadcast</h1>
        <form action={postAnnouncement} className="bg-white p-6 border border-gray-200 flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Headline</label>
                <Input name="title" required placeholder="Launch Update 1.0" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Message Body</label>
                <textarea name="content" required className="w-full h-32 border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary"></textarea>
            </div>
            <Button type="submit">Broadcast to All Students</Button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">Recent Broadcasts</h2>
        <div className="space-y-4">
            {announcements?.map(ann => (
                <div key={ann.id} className="p-4 border border-gray-200 bg-brand-surface text-sm">
                    <div className="font-bold">{ann.title}</div>
                    <div className="text-gray-600 truncate">{ann.content}</div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
