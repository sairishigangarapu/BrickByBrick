'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { updateUserRole } from '../actions';

async function getUser(userId: string) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

async function getUserEnrollments(userId: string) {
  const { data } = await supabaseAdmin
    .from('enrollments')
    .select(`
      id,
      created_at,
      courses (
        id,
        title,
        description,
        thumbnail_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const [user, enrollments] = await Promise.all([
    getUser(userId),
    getUserEnrollments(userId)
  ]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">User not found</h2>
        <Link href="/admin/users">
          <Button className="mt-4">Back to Users</Button>
        </Link>
      </div>
    );
  }

  const stats = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter((e: any) => (e as any).progress_percent === 100).length,
    enrolledDate: user.created_at,
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">← Back</Button>
        </Link>
        <h1 className="text-3xl font-black">User Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center mb-6">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name || ''} 
                    className="w-24 h-24 rounded-full object-cover mb-4" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <span className="text-3xl text-gray-500">
                      {(user.full_name || user.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-bold">{user.full_name || 'No name'}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Role</span>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role || 'student'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Joined</span>
                  <span className="text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">User ID</span>
                  <span className="text-xs font-mono text-gray-400">{user.clerk_id}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-6 pt-4">
                <h3 className="font-semibold mb-3">Change Role</h3>
                <div className="flex gap-2">
                  <RoleButton userId={user.id} role="student" currentRole={user.role} />
                  <RoleButton userId={user.id} role="admin" currentRole={user.role} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-gray-200 mb-6">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-4">Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-black text-orange-600">{stats.totalCourses}</div>
                  <div className="text-sm text-gray-500">Enrolled Courses</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-black text-green-600">{stats.completedCourses}</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-black text-blue-600">
                    {stats.totalCourses > 0 
                      ? Math.round((stats.completedCourses / stats.totalCourses) * 100) 
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-4">Enrolled Courses</h3>
              {enrollments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No courses enrolled yet.</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment: any) => (
                    <div 
                      key={enrollment.id} 
                      className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {enrollment.courses?.thumbnail_url ? (
                          <img 
                            src={enrollment.courses.thumbnail_url} 
                            alt={enrollment.courses.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{enrollment.courses?.title || 'Unknown Course'}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {enrollment.courses?.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={0} className="flex-1 h-2" />
                          <span className="text-xs text-gray-500">0%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">
                          Enrolled {new Date(enrollment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RoleButton({ userId, role, currentRole }: { userId: string; role: string; currentRole?: string }) {
  const isActive = currentRole === role;
  
  return (
    <form action={async () => {
      'use server';
      await updateUserRole(userId, role);
    }}>
      <Button 
        type="submit" 
        variant={isActive ? 'default' : 'outline'} 
        size="sm"
        disabled={isActive}
      >
        {role === 'admin' ? 'Admin' : 'Student'}
      </Button>
    </form>
  );
}