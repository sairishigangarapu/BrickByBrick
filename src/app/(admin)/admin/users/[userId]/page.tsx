import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { AdminUserDetailClient } from './AdminUserDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ userId: string }> | { userId: string };
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const userId = resolvedParams.userId;

  if (!supabaseAdmin) {
    notFound();
  }

  const { data: user, error: userErr } = await supabaseAdmin
    .from('users')
    .select('id, clerk_id, email, full_name, avatar_url, role, xp, level, is_accredited, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (userErr || !user) {
    notFound();
  }

  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('id, course_id, progress_percent, is_completed, enrolled_at, completed_at, courses(id, title)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  const { data: bookmarks } = await supabaseAdmin
    .from('user_bookmarks')
    .select('id, bookmarkable_type, bookmarkable_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/admin/users" className="text-xs text-zinc-500 hover:text-zinc-900 uppercase tracking-widest font-bold">
          ← All Users
        </Link>
        <h1 className="text-2xl md:text-3xl font-black mt-2">User Detail</h1>
      </div>
      <AdminUserDetailClient
        user={user}
        enrollments={(enrollments ?? []) as Array<{
          id: string;
          course_id: string;
          progress_percent: number;
          is_completed: boolean;
          enrolled_at: string;
          completed_at: string | null;
          courses: { id: string; title: string } | { id: string; title: string }[] | null;
        }>}
        bookmarks={(bookmarks ?? []) as Array<{
          id: string;
          bookmarkable_type: string;
          bookmarkable_id: string;
          created_at: string;
        }>}
      />
    </div>
  );
}
