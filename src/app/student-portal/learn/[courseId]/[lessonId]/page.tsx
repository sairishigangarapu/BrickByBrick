import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getServerSupabase } from '@/lib/server-supabase';
import LessonPlayerClient from './LessonPlayerClient';
import { getLessonProgress } from '@/app/actions/lesson-progress';

export default async function LessonPlayerPage({ 
  params 
}: { 
  params: Promise<{ courseId: string; lessonId: string }> 
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { courseId, lessonId } = await params;

  const supabase = await getServerSupabase();

  // Load course info
  const { data: courseData } = await supabase
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .single();

  if (!courseData) {
    redirect('/student-portal/dashboard');
  }

  // Load modules and lessons
  const { data: modulesData } = await supabase
    .from('modules')
    .select('id, title, order_index, lessons(id, title, content_type, content_url, order_index)')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (!modulesData || modulesData.length === 0) {
    redirect('/student-portal/dashboard');
  }

  const sortedModules = modulesData.map(m => ({
    ...m,
    lessons: (m.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
  }));

  // Find current lesson
  let currentLesson = null;
  for (const module of sortedModules) {
    const lesson = module.lessons.find((l: any) => l.id === lessonId);
    if (lesson) {
      currentLesson = lesson;
      break;
    }
  }

  if (!currentLesson) {
    redirect('/student-portal/dashboard');
  }

  // Load progress
  const progressResult = await getLessonProgress(courseId);
  const completedLessons = progressResult.success ? progressResult.completedLessons : [];

  return (
    <LessonPlayerClient
      initialLesson={currentLesson}
      initialModules={sortedModules}
      courseId={courseId}
      courseName={courseData.title}
      initialCompletedLessons={completedLessons}
    />
  );
}
