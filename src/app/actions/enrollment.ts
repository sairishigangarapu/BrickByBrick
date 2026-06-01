'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ensureSupabaseUser } from '@/lib/ensure-supabase-user';

export async function enrollInCourseAction(courseId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('You must be signed in to enroll in a course.');
  }

  const user = await currentUser();
  if (!user) {
    throw new Error('User not found.');
  }

  await ensureSupabaseUser(user);

  const { data: dbUser, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (userError || !dbUser) {
    throw new Error('User profile not found. Please contact support.');
  }

  const { data: existingEnrollment } = await supabaseAdmin
    .from('enrollments')
    .select('id')
    .eq('user_id', dbUser.id)
    .eq('course_id', courseId)
    .maybeSingle();

  if (existingEnrollment) {
    throw new Error('You are already enrolled in this course.');
  }

  const { error: enrollError } = await supabaseAdmin.from('enrollments')
    .insert({
      user_id: dbUser.id,
      course_id: courseId,
    });

  if (enrollError) {
    throw new Error('Failed to enroll. Please try again.');
  }

  revalidatePath('/dashboard');
  revalidatePath(`/courses/${courseId}`);
  redirect(`/learn/${courseId}`);
}

export async function checkEnrollmentStatus(courseId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!dbUser) {
    return false;
  }

  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('id')
    .eq('user_id', dbUser.id)
    .eq('course_id', courseId)
    .maybeSingle();

  return !!enrollment;
}