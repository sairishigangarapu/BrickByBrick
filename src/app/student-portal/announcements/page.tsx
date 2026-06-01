import { auth } from '@clerk/nextjs/server';
import React from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';

export default async function AnnouncementsPage() {
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8">Platform Announcements</h1>
      <div className="space-y-4">
        {!announcements || announcements.length === 0 ? (
            <div className="p-6 border border-gray-200 bg-white text-center text-gray-500">No announcements right now.</div>
        ) : (
            announcements.map(ann => (
                <div key={ann.id} className="p-6 border border-brand-primary bg-white shadow-sm">
                    <Badge className="mb-3" variant="secondary">Update</Badge>
                    <h2 className="text-2xl font-bold">{ann.title}</h2>
                    <p className="text-gray-600 mt-2 leading-relaxed">{ann.content}</p>
                    <div className="text-xs text-gray-400 mt-4 uppercase tracking-wider">{new Date(ann.created_at).toLocaleDateString()}</div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
