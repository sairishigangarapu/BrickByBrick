'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

async function getMetrics() {
  const [{ count: users }, { count: courses }, { count: enrollments }] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }),
  ]);

  return {
    users: users || 0,
    courses: courses || 0,
    enrollments: enrollments || 0,
  };
}

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const metrics = await getMetrics();

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-gray-500 uppercase tracking-widest text-xs">Total Students</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold">{metrics.users}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-gray-500 uppercase tracking-widest text-xs">Total Courses</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold">{metrics.courses}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-gray-500 uppercase tracking-widest text-xs">Active Learners</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold">{metrics.users}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-gray-500 uppercase tracking-widest text-xs">Total Enrollments</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold">{metrics.enrollments}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}