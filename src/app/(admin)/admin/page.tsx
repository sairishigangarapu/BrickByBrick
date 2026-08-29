import React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  Users, 
  TrendingUp, 
  Database, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen
} from 'lucide-react';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { WaitlistChart } from './WaitlistChart';

export const revalidate = 0; // Disable caching for the admin dashboard so data is always fresh

export default async function AdminDashboardPage() {
  // Fetch aggregate counts concurrently
  const [
    { count: waitlistCount },
    { count: usersCount },
    { count: coursesCount },
    { count: listingsCount }
  ] = await Promise.all([
    supabaseAdmin.from('waitlist').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('investment_listings').select('*', { count: 'exact', head: true })
  ]);

  // Fetch recent waitlist signups and full history for chart
  const { data: waitlistData } = await supabaseAdmin
    .from('waitlist')
    .select('email, created_at')
    .order('created_at', { ascending: false });

  const recentWaitlist = waitlistData?.slice(0, 5) || [];

  // Process data for the chart (last 7 days of signups)
  const chartDataMap: Record<string, number> = {};
  
  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    chartDataMap[format(d, 'MMM dd')] = 0;
  }

  // Aggregate signups
  if (waitlistData) {
    waitlistData.forEach(entry => {
      if (entry.created_at) {
        const dateStr = format(new Date(entry.created_at), 'MMM dd');
        if (chartDataMap[dateStr] !== undefined) {
          chartDataMap[dateStr] += 1;
        }
      }
    });
  }

  const chartData = Object.entries(chartDataMap).map(([date, signups]) => ({
    date,
    signups
  }));
  const metrics = [
    {
      title: 'Total Waitlist',
      value: waitlistCount?.toLocaleString() || '0',
      change: 'Active',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Registered Users',
      value: usersCount?.toLocaleString() || '0',
      change: 'Active',
      trend: 'up',
      icon: Activity
    },
    {
      title: 'Published Courses',
      value: coursesCount?.toLocaleString() || '0',
      change: 'Live',
      trend: 'neutral',
      icon: BookOpen
    },
    {
      title: 'DB Listings (Internal)',
      value: listingsCount?.toLocaleString() || '0',
      change: 'Tracked',
      trend: 'neutral',
      icon: Database
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-2 text-white">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome back. Here is what's happening on your platform today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-zinc-800 rounded-lg">
                <metric.icon className="w-6 h-6 text-orange-500" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${
                metric.trend === 'up' ? 'text-green-500' : 
                metric.trend === 'down' ? 'text-red-500' : 
                'text-blue-500'
              }`}>
                {metric.change}
                {metric.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                {metric.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400 mb-1">{metric.title}</p>
              <h3 className="text-3xl font-black text-white">{metric.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Activity Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-96 flex flex-col">
          <h3 className="font-bold text-lg mb-6 text-white">Waitlist Growth (Last 7 Days)</h3>
          <div className="flex-1 w-full">
            <WaitlistChart data={chartData} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-6 text-white">Recent Waitlist Signups</h3>
          <div className="flex-1 space-y-4">
            {recentWaitlist?.map((activity, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-0">
                <div>
                  <p className="font-medium text-sm text-zinc-300">{activity.email}</p>
                  <p className="text-xs text-zinc-500">New Signup</p>
                </div>
                <span className="text-xs text-zinc-500">
                  {activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) : 'Just now'}
                </span>
              </div>
            ))}
            
            {(!recentWaitlist || recentWaitlist.length === 0) && (
              <div className="py-8 text-center text-sm text-zinc-500">
                No recent signups found.
              </div>
            )}
          </div>
          <button className="w-full mt-4 py-2 border border-zinc-700 text-sm font-bold rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors">
            View All Waitlist
          </button>
        </div>
      </div>
    </div>
  );
}