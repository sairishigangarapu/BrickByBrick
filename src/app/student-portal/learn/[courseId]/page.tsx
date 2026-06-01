import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!dbUser) {
    redirect('/sign-in');
  }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', dbUser.id)
    .eq('course_id', courseId)
    .single();

  if (!enrollment) {
    redirect(`/courses/${courseId}`);
  }

  const { data: modules } = await supabase
    .from('modules')
    .select('id, lessons(id)')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  const firstLessonId = modules?.[0]?.lessons?.[0]?.id;

  if (firstLessonId) {
    redirect(`/student-portal/learn/${courseId}/${firstLessonId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>No lessons available in this course.</p>
    </div>
  );
}