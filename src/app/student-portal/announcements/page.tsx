import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function StudentAnnouncementsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { data: announcements } = await supabaseAdmin
    .from('announcements')
    .select('id, title, body, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-black mb-2">Announcements</h1>
      <p className="text-zinc-500 text-sm mb-8">Latest broadcasts from the BrickByBrick team.</p>

      {(!announcements || announcements.length === 0) ? (
        <div className="p-12 text-center border border-dashed border-zinc-300 text-zinc-500 text-sm rounded-2xl">
          No announcements yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="p-5 bg-white border border-zinc-200 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-lg">{a.title}</h2>
                <span className="text-xs text-zinc-500">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
