'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { adjustUserXPAction, updateUserRole } from '../actions';

interface UserShape {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  xp: number | null;
  level: number | null;
  is_accredited: boolean | null;
  created_at: string;
}

interface EnrollmentShape {
  id: string;
  course_id: string;
  progress_percent: number;
  is_completed: boolean;
  enrolled_at: string;
  completed_at: string | null;
  courses: { id: string; title: string } | { id: string; title: string }[] | null;
}

interface BookmarkShape {
  id: string;
  bookmarkable_type: string;
  bookmarkable_id: string;
  created_at: string;
}

const ROLES = ['user', 'admin', 'investment_provider', 'accredited_investor'] as const;

function courseTitle(courses: EnrollmentShape['courses']): string {
  if (!courses) return 'Unknown Course';
  if (Array.isArray(courses)) return courses[0]?.title ?? 'Unknown Course';
  return courses.title ?? 'Unknown Course';
}

export function AdminUserDetailClient({
  user,
  enrollments,
  bookmarks,
}: {
  user: UserShape;
  enrollments: EnrollmentShape[];
  bookmarks: BookmarkShape[];
}) {
  const [role, setRole] = useState(user.role ?? 'user');
  const [xpDelta, setXpDelta] = useState(10);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleRoleChange = (next: string) => {
    setRole(next);
    setError(null);
    setNotice(null);
    startTransition(async () => {
      try {
        await updateUserRole(user.id, next);
        setNotice('Role updated.');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update role');
      }
    });
  };

  const handleXpAdjust = () => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      try {
        await adjustUserXPAction(user.id, xpDelta);
        setNotice('XP updated. Reload to see the new value.');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update XP');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex items-start gap-4">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={user.full_name ?? user.email}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center text-2xl text-zinc-500 font-bold">
              {(user.full_name ?? user.email ?? '?')[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{user.full_name || 'No name'}</h2>
            <p className="text-sm text-zinc-500 truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role ?? 'user'}</Badge>
              <span className="text-xs text-zinc-500">XP {user.xp ?? 0} · Level {user.level ?? 1}</span>
              {user.is_accredited && <Badge variant="default">Accredited</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest">Update role</h3>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={pending}
              className="w-full p-2 border border-zinc-300 rounded-md bg-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {notice && <p className="text-sm text-emerald-600">{notice}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest">Adjust XP</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={xpDelta}
                onChange={(e) => setXpDelta(parseInt(e.target.value || '0', 10))}
                className="flex-1 p-2 border border-zinc-300 rounded-md"
              />
              <Button onClick={handleXpAdjust} disabled={pending}>
                Apply
              </Button>
            </div>
            <p className="text-xs text-zinc-500">
              Adds (or subtracts) the given XP from the user. Level auto-recomputes.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4">Course enrollments</h3>
          {enrollments.length === 0 ? (
            <p className="text-sm text-zinc-500">No enrollments yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {enrollments.map((e) => (
                <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{courseTitle(e.courses)}</p>
                    <p className="text-xs text-zinc-500">
                      Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                      {e.completed_at ? ` · Completed ${new Date(e.completed_at).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-32 h-2 bg-zinc-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-orange-600"
                        style={{ width: `${Math.min(100, Math.max(0, e.progress_percent ?? 0))}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-zinc-600 w-10 text-right">
                      {e.progress_percent ?? 0}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4">Bookmarks</h3>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-zinc-500">No bookmarks yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {bookmarks.map((b) => (
                <li key={b.id} className="py-3 flex items-center justify-between text-sm">
                  <span className="font-semibold">{b.bookmarkable_type}</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(b.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
