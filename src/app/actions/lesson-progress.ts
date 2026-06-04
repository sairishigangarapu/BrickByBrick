'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSupabase } from '@/lib/server-supabase';
import { ensureSupabaseUser } from '@/lib/ensure-supabase-user';

export async function toggleLessonCompletion(lessonId: string, courseId: string, isCompleted: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get Clerk user and ensure exists in Supabase
    const clerkUser = await currentUser();
    await ensureSupabaseUser(clerkUser);

    const supabase = await getServerSupabase();

    // Get Supabase user ID
    const { data: supabaseUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!supabaseUser) {
      return { success: false, error: 'User not found' };
    }

    // Check if progress record exists
    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', supabaseUser.id)
      .eq('lesson_id', lessonId)
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('lesson_progress')
        .update({
          is_completed: isCompleted,
          last_watched_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: supabaseUser.id,
          lesson_id: lessonId,
          course_id: courseId,
          is_completed: isCompleted,
          last_watched_at: new Date().toISOString(),
        });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update progress' };
  }
}

export async function getLessonProgress(courseId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, completedLessons: [] };
    }

    const supabase = await getServerSupabase();

    // Get Clerk user and ensure exists in Supabase
    const clerkUser = await currentUser();
    await ensureSupabaseUser(clerkUser);

    // Get Supabase user ID
    const { data: supabaseUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!supabaseUser) {
      return { success: false, completedLessons: [] };
    }

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id, is_completed')
      .eq('user_id', supabaseUser.id)
      .eq('course_id', courseId)
      .eq('is_completed', true);

    if (error) throw error;

    return {
      success: true,
      completedLessons: data?.map(p => p.lesson_id) || [],
    };
  } catch (error) {
    return { success: false, completedLessons: [] };
  }
}

export async function getAllUsersProgress(courseId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, progress: [] };
    }

    // Get Clerk user and ensure exists in Supabase
    const clerkUser = await currentUser();
    await ensureSupabaseUser(clerkUser);

    // Verify admin role
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all progress for this course
    const { data, error } = await supabaseAdmin
      .from('lesson_progress')
      .select(`
        *,
        users!inner(full_name, email),
        lessons!inner(title, module_id)
      `)
      .eq('course_id', courseId);

    if (error) throw error;

    return { success: true, progress: data || [] };
  } catch (error) {
    return { success: false, progress: [] };
  }
}
