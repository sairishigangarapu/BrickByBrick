import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { XPProgress } from '@/components/learn/XPProgress';

export default async function StudentDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // 1. Fetch user UUID from Supabase via Clerk ID
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  let enrolledCourses: any[] = [];

  if (userData?.id) {
    // 2. Fetch enrollments for the user, joining with courses
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        course_id,
        courses (
          id,
          title,
          thumbnail_url
        )
      `)
      .eq('user_id', userData.id);
    
    if (enrollments) {
      // For each course, get the first lesson
      const coursesWithFirstLesson = await Promise.all(
        enrollments.map(async (e) => {
          // Get first module and first lesson
          const { data: modules } = await supabaseAdmin
            .from('modules')
            .select('id, lessons(id, order_index)')
            .eq('course_id', e.course_id)
            .order('order_index', { ascending: true })
            .limit(1);
          
          let firstLessonId = null;
          if (modules && modules.length > 0 && modules[0].lessons) {
            const lessons = Array.isArray(modules[0].lessons) ? modules[0].lessons : [modules[0].lessons];
            const sortedLessons = lessons.sort((a: any, b: any) => a.order_index - b.order_index);
            firstLessonId = sortedLessons[0]?.id;
          }
          
          return {
            ...e.courses,
            firstLessonId,
            progress_percent: 0, // Placeholder: later calculate (completed lessons / total)*100
          };
        })
      );
      
      enrolledCourses = coursesWithFirstLesson;
    }
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-black tracking-tight mb-8">Dashboard</h1>
      
      <div className="mb-8">
        <XPProgress />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Your Active Courses</h2>
            
            {enrolledCourses.length === 0 ? (
                <div className="p-8 border border-gray-200 bg-white text-center flex flex-col items-center">
                    <p className="text-gray-500 mb-4">You are not enrolled in any courses yet.</p>
                    <Link href="/courses">
                        <Button>Browse Catalog</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {enrolledCourses.map((course: any) => (
                        <Card key={course.id} className="flex flex-col sm:flex-row overflow-hidden border-gray-200 shadow-none">
                            <div className="bg-gray-100 sm:w-1/3 flex items-center justify-center p-4 border-r border-gray-100">
                                {course.title} Cover
                            </div>
                            <CardContent className="pt-6 flex-1 flex flex-col justify-center">
                                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1">
                                        <Progress value={course.progress_percent} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500 w-12 text-right">
                                        {course.progress_percent}%
                                    </span>
                                </div>
                                <Link href={course.firstLessonId ? `/student-portal/learn/${course.id}/${course.firstLessonId}` : `/student-portal/learn/${course.id}`}>
                                    <Button variant="outline" size="sm">
                                      {course.firstLessonId ? 'Continue Learning' : 'View Course'}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>

        <div className="p-6 border border-gray-200 bg-brand-surface h-fit">
          <h2 className="font-semibold mb-4 text-brand-primary uppercase tracking-widest text-sm">Recent Announcements</h2>
          <div className="space-y-4">
              <div className="p-4 bg-white border border-gray-200">
                  <p className="font-medium text-sm">Welcome to the platform! Please complete your profile details.</p>
                  <p className="text-xs text-gray-400 mt-2">Just now</p>
              </div>
          </div>
          <Link href="/student-portal/announcements">
              <Button variant="ghost" className="w-full mt-4 border border-gray-300">View All</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
