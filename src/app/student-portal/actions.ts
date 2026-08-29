'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { computeLevelFromXP } from '@/lib/levels';

const XP_PER_LESSON = 5;
const XP_PER_COURSE_BONUS = 50;

interface CourseLesson {
  id: string;
  module_id: string;
  course_id: string;
  order_index: number;
}

function buildAuthedClerkUser() {
  return currentUser();
}

export async function enrollInCourseAction(courseId: string): Promise<{ ok: true }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error('Unauthorized. Please sign in again.');

  const user = await buildAuthedClerkUser();
  if (!user) throw new Error('Unauthorized.');

  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (!existingUser) {
    const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? null;
    if (!email) throw new Error('No email on user.');
    const { data: created, error: createErr } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: clerkId,
        email,
        full_name: user.fullName ?? null,
        avatar_url: user.imageUrl ?? null,
        role: 'user',
      })
      .select('id')
      .single();
    if (createErr) throw new Error(createErr.message);
    if (!created) throw new Error('Could not create user.');
    return finalizeEnrollment(created.id, courseId);
  }

  return finalizeEnrollment(existingUser.id, courseId);
}

async function finalizeEnrollment(userId: string, courseId: string): Promise<{ ok: true }> {
  // Idempotent: if enrollment exists, do nothing.
  const { data: existingEnrollment } = await supabaseAdmin
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (existingEnrollment) {
    revalidatePath(`/courses/${courseId}`);
    revalidatePath('/student-portal/dashboard');
    return { ok: true };
  }

  const { error } = await supabaseAdmin.from('enrollments').insert({
    user_id: userId,
    course_id: courseId,
    progress_percent: 0,
    is_completed: false,
  });

  if (error) {
    if (error.code === '23505') {
      // Race: another request already created the enrollment.
      revalidatePath(`/courses/${courseId}`);
      revalidatePath('/student-portal/dashboard');
      return { ok: true };
    }
    throw new Error(error.message);
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/student-portal/dashboard');
  return { ok: true };
}

export async function markLessonCompleteAction(
  lessonId: string,
  courseId: string
): Promise<{ ok: true; progress_percent: number }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error('Unauthorized.');

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (!dbUser) throw new Error('User not provisioned yet.');

  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('id, progress_percent, is_completed')
    .eq('user_id', dbUser.id)
    .eq('course_id', courseId)
    .maybeSingle();

  if (!enrollment) {
    // Auto-enroll on first mark-complete attempt (defensive UX)
    await enrollInCourseAction(courseId);
    return markLessonCompleteAction(lessonId, courseId);
  }

  // Idempotent: check if lesson was already completed
  const { data: existingProgress } = await supabaseAdmin
    .from('lesson_progress')
    .select('id, is_completed')
    .eq('enrollment_id', enrollment.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (existingProgress?.is_completed) {
    return { ok: true, progress_percent: enrollment.progress_percent ?? 0 };
  }

  const { error: lpErr } = await supabaseAdmin.from('lesson_progress').upsert(
    {
      enrollment_id: enrollment.id,
      lesson_id: lessonId,
      is_completed: true,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: 'enrollment_id,lesson_id' }
  );

  if (lpErr) {
    if (lpErr.code !== '23505') {
      throw new Error(lpErr.message);
    }
  }

  // Recompute progress
  const { count: totalLessons } = await supabaseAdmin
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId);

  const { count: completedLessons } = await supabaseAdmin
    .from('lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('enrollment_id', enrollment.id)
    .eq('is_completed', true);

  const total = totalLessons ?? 0;
  const completed = completedLessons ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const justCompletedNow = pct === 100 && !enrollment.is_completed;

  await supabaseAdmin
    .from('enrollments')
    .update({
      progress_percent: pct,
      is_completed: pct === 100,
      completed_at: pct === 100 ? new Date().toISOString() : null,
    })
    .eq('id', enrollment.id);

  // Award XP
  const xpDelta = XP_PER_LESSON + (justCompletedNow ? XP_PER_COURSE_BONUS : 0);
  if (xpDelta > 0) {
    const { data: u } = await supabaseAdmin.from('users').select('xp').eq('id', dbUser.id).single();
    const currentXP = u?.xp ?? 0;
    const newXP = currentXP + xpDelta;
    const newLevel = computeLevelFromXP(newXP);
    await supabaseAdmin.from('users').update({ xp: newXP, level: newLevel }).eq('id', dbUser.id);
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/student-portal/dashboard');
  return { ok: true, progress_percent: pct };
}

export async function getEnrollmentForCourseAction(courseId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (!dbUser) return null;

  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('id, progress_percent, is_completed, enrolled_at, completed_at')
    .eq('user_id', dbUser.id)
    .eq('course_id', courseId)
    .maybeSingle();

  if (!enrollment) return null;

  const { data: completedRows } = await supabaseAdmin
    .from('lesson_progress')
    .select('lesson_id')
    .eq('enrollment_id', enrollment.id)
    .eq('is_completed', true);

  return {
    ...enrollment,
    completedLessonIds: (completedRows ?? []).map((r: { lesson_id: string }) => r.lesson_id),
  };
}

// Avoid linting complaints about unused imports of CourseLesson if tree-shaken
type _CourseLesson = CourseLesson;
