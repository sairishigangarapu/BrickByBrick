import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { XPProgress } from '@/components/learn/XPProgress';

export const revalidate = 0;

interface CourseRow {
  id: string;
  title: string;
  thumbnail_url: string | null;
}

interface EnrollmentRow {
  id: string;
  course_id: string;
  progress_percent: number;
  is_completed: boolean;
  enrolled_at: string;
  completed_at: string | null;
  courses: CourseRow | CourseRow[] | null;
}

function normalizeCourse(row: CourseRow | CourseRow[] | null): CourseRow | null {
  if (!row) return null;
  if (Array.isArray(row)) return row[0] ?? null;
  return row;
}

export default async function StudentDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('id, xp, level')
    .eq('clerk_id', userId)
    .single();

  const userXP = userData?.xp ?? 0;
  const userLevel = userData?.level ?? 1;

  let enrollments: EnrollmentRow[] = [];
  let firstLessonByCourse: Record<string, string | null> = {};

  if (userData?.id) {
    const { data: enrollmentData } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id, course_id, progress_percent, is_completed, enrolled_at, completed_at,
        courses ( id, title, thumbnail_url )
      `)
      .eq('user_id', userData.id)
      .order('enrolled_at', { ascending: false });

    enrollments = (enrollmentData ?? []) as EnrollmentRow[];

    if (enrollments.length > 0) {
      const courseIds = enrollments.map((e) => e.course_id);
      const { data: lessons } = await supabaseAdmin
        .from('lessons')
        .select('id, course_id, module_id, order_index, modules!inner(order_index)')
        .in('course_id', courseIds)
        .order('order_index', { ascending: true });

      const firstByCourse: Record<string, string | null> = {};
      for (const lesson of (lessons ?? []) as Array<{
        id: string;
        course_id: string;
        module_id: string;
        order_index: number;
        modules: { order_index: number } | { order_index: number }[] | null;
      }>) {
        if (firstByCourse[lesson.course_id]) continue;
        firstByCourse[lesson.course_id] = lesson.id;
      }
      firstLessonByCourse = firstByCourse;
    }
  }

  const completed = enrollments.filter((e) => e.is_completed || e.progress_percent === 100);
  const inProgress = enrollments.filter(
    (e) => !e.is_completed && e.progress_percent > 0 && e.progress_percent < 100
  );
  const pending = enrollments.filter(
    (e) => !e.is_completed && e.progress_percent === 0
  );

  const hasAnyEnrollments = enrollments.length > 0;

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-black tracking-tight mb-2">Dashboard</h1>
      <p className="text-zinc-500 mb-8 text-sm">
        {hasAnyEnrollments
          ? `${enrollments.length} course${enrollments.length === 1 ? '' : 's'} · ${completed.length} completed`
          : 'Track your learning, monitor progress, and continue where you left off.'}
      </p>

      <div className="mb-10">
        <XPProgress initialXP={userXP} initialLevel={userLevel} />
      </div>

      {!hasAnyEnrollments ? (
        <Card className="p-12 text-center">
          <p className="text-zinc-700 font-semibold mb-2">You have not enrolled in any courses yet.</p>
          <p className="text-zinc-500 text-sm mb-6">Browse the catalog to start your first course.</p>
          <Link href="/courses">
            <Button>Browse Catalog</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-10">
          <Section title="In Progress" courses={inProgress} firstLessonByCourse={firstLessonByCourse} />
          <Section title="Pending" courses={pending} firstLessonByCourse={firstLessonByCourse} />
          <Section title="Completed" courses={completed} firstLessonByCourse={firstLessonByCourse} />
        </div>
      )}

      {hasAnyEnrollments && (
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2" />
          <div className="p-6 border border-gray-200 bg-zinc-50 h-fit">
            <h2 className="font-semibold mb-4 text-orange-600 uppercase tracking-widest text-sm">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {enrollments.slice(0, 4).map((e) => {
                const course = normalizeCourse(e.courses);
                if (!course) return null;
                return (
                  <div key={e.id} className="p-3 bg-white border border-gray-200 rounded">
                    <p className="font-medium text-sm">
                      {e.is_completed
                        ? `Completed ${course.title}`
                        : e.progress_percent > 0
                        ? `Progress on ${course.title}: ${e.progress_percent}%`
                        : `Enrolled in ${course.title}`}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {e.completed_at
                        ? `Finished ${new Date(e.completed_at).toLocaleDateString()}`
                        : `Enrolled ${new Date(e.enrolled_at).toLocaleDateString()}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  courses,
  firstLessonByCourse,
}: {
  title: string;
  courses: EnrollmentRow[];
  firstLessonByCourse: Record<string, string | null>;
}) {
  if (courses.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        {title}
        <span className="text-xs text-zinc-500 font-medium">({courses.length})</span>
      </h2>
      <div className="space-y-4">
        {courses.map((e) => {
          const course = normalizeCourse(e.courses);
          if (!course) return null;
          const firstLessonId = firstLessonByCourse[e.course_id];
          const href = firstLessonId
            ? `/student-portal/learn/${e.course_id}/${firstLessonId}`
            : `/courses/${e.course_id}`;
          const ctaLabel = e.progress_percent > 0
            ? 'Continue Learning'
            : e.is_completed
            ? 'Review Course'
            : 'Start Course';

          return (
            <Card
              key={e.id}
              className="flex flex-col sm:flex-row overflow-hidden border-gray-200 shadow-none"
            >
              <div className="bg-zinc-100 sm:w-1/3 flex items-center justify-center border-r border-zinc-100 min-h-[140px]">
                {course.thumbnail_url ? (
                  <div className="relative w-full h-full min-h-[140px]">
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider px-4 text-center">
                    {course.title}
                  </span>
                )}
              </div>
              <CardContent className="pt-6 flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-3">{course.title}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <Progress value={e.progress_percent} />
                  </div>
                  <span className="text-sm font-semibold text-zinc-600 w-12 text-right">
                    {e.progress_percent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Link href={href}>
                    <Button variant="outline" size="sm">
                      {ctaLabel}
                    </Button>
                  </Link>
                  {e.is_completed && (
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
