'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

async function getUsers() {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const users = await getUsers();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-black">Users</h1>
      </div>
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="hidden md:table w-full text-left">
          <table className="w-full">
            <thead className="bg-brand-surface border-b border-gray-200 uppercase text-xs tracking-wider text-gray-500">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td className="p-4" colSpan={4}>No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name || ''} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">{(user.full_name || user.email || '?')[0].toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role || 'student'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="block md:hidden">
          {users.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No users found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <Link key={user.id} href={`/admin/users/${user.id}`} className="block p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || ''} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">{(user.full_name || user.email || '?')[0].toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role || 'student'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}