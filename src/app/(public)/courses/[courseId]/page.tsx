import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { SafeHtml } from '@/components/ui/SafeHtml';
import { CourseEnrollControls } from './CourseEnrollControls';
import { CourseLessonList } from './CourseLessonList';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ courseId: string }> | { courseId: string };
}

interface ModuleRow {
  id: string;
  title: string;
  order_index: number;
}

interface LessonRow {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  content_type: 'video' | 'pdf' | 'text' | 'quiz';
  content_url: string | null;
  order_index: number;
}

interface EnrollmentRow {
  id: string;
  progress_percent: number;
  is_completed: boolean;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const courseId = resolvedParams.courseId;

  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('id, title, description, thumbnail_url, is_published, created_at')
    .eq('id', courseId)
    .maybeSingle();

  if (courseError || !course) {
    notFound();
  }

  const { userId } = await auth();
  let dbUserId: string | null = null;
  if (userId) {
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .maybeSingle();
    dbUserId = dbUser?.id ?? null;
  }

  const { data: modulesData } = await supabaseAdmin
    .from('modules')
    .select('id, title, order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  const { data: lessonsData } = await supabaseAdmin
    .from('lessons')
    .select('id, module_id, course_id, title, content_type, content_url, order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  const modules: ModuleRow[] = (modulesData ?? []) as ModuleRow[];
  const lessons: LessonRow[] = (lessonsData ?? []) as LessonRow[];

  let enrollment: EnrollmentRow | null = null;
  let completedLessonIds: Set<string> = new Set();

  if (dbUserId) {
    const { data: enrollmentData } = await supabaseAdmin
      .from('enrollments')
      .select('id, progress_percent, is_completed')
      .eq('user_id', dbUserId)
      .eq('course_id', courseId)
      .maybeSingle();
    enrollment = (enrollmentData ?? null) as EnrollmentRow | null;

    if (enrollment) {
      const { data: progressData } = await supabaseAdmin
        .from('lesson_progress')
        .select('lesson_id')
        .eq('enrollment_id', enrollment.id)
        .eq('is_completed', true);
      completedLessonIds = new Set(
        ((progressData ?? []) as Array<{ lesson_id: string }>).map((r) => r.lesson_id)
      );
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <Link
              href="/courses"
              className="text-xs text-zinc-400 hover:text-white uppercase tracking-widest font-bold"
            >
              ← All Courses
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-3">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider font-bold">
              <span>{lessons.length} lessons</span>
              <span aria-hidden="true">·</span>
              <span>{modules.length} modules</span>
              {enrollment && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-orange-400">
                    {enrollment.progress_percent}% complete
                  </span>
                </>
              )}
            </div>
          </div>
          {course.thumbnail_url && (
            <div className="relative w-full aspect-video md:aspect-square rounded-2xl overflow-hidden border border-zinc-800">
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {course.description ? (
            <section>
              <h2 className="text-lg font-black uppercase mb-3">About this course</h2>
              <SafeHtml html={course.description} className="prose prose-sm max-w-none text-zinc-700 leading-relaxed" />
            </section>
          ) : null}

          <section>
            <h2 className="text-lg font-black uppercase mb-4">Curriculum</h2>
            {lessons.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-300 text-center text-zinc-500 text-sm">
                Curriculum is being built. Check back soon.
              </div>
            ) : (
              <CourseLessonList
                modules={modules}
                lessons={lessons}
                completedLessonIds={Array.from(completedLessonIds)}
                isEnrolled={!!enrollment}
              />
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <CourseEnrollControls
            courseId={course.id}
            isSignedIn={!!userId}
            isEnrolled={!!enrollment}
            progressPercent={enrollment?.progress_percent ?? 0}
            isCompleted={enrollment?.is_completed ?? false}
          />

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-wider mb-2">Course Details</h3>
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Lessons</dt>
                <dd className="font-bold">{lessons.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Modules</dt>
                <dd className="font-bold">{modules.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Status</dt>
                <dd className="font-bold">{course.is_published ? 'Published' : 'Draft'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Created</dt>
                <dd className="font-bold">
                  {new Date(course.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
