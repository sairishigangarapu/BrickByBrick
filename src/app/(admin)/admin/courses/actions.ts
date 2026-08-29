'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type CreateCoursePayload = {
    title: string;
    description: string;
    thumbnailUrl?: string | null;
};

type LessonContentType = 'video' | 'pdf' | 'text' | 'quiz';

function isValidHttpUrl(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

async function ensureAdminAccess() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error('Unauthorized. Please sign in again.');
    }

    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
        throw new Error('Forbidden. Admin access required.');
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.');
    }
}

export async function createCourseAction(payload: CreateCoursePayload) {
    await ensureAdminAccess();

    const { data: course, error } = await supabaseAdmin.from('courses').insert({
        title: payload.title,
        description: payload.description,
        thumbnail_url: payload.thumbnailUrl || null,
        is_published: false
    }).select('id').single();

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/courses');
    redirect(`/admin/courses/${course.id}`);
}

export async function createModuleAction(courseId: string, title: string) {
    await ensureAdminAccess();

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
        throw new Error('Module title is required.');
    }

    const { data: lastModule } = await supabaseAdmin
        .from('modules')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextOrderIndex = (lastModule?.order_index ?? -1) + 1;

    const { data, error } = await supabaseAdmin
        .from('modules')
        .insert({
            course_id: courseId,
            title: normalizedTitle,
            order_index: nextOrderIndex,
        })
        .select('*')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return data;
}

export async function createLessonAction(input: {
    courseId: string;
    moduleId: string;
    title: string;
    contentType: LessonContentType;
    contentUrl?: string | null;
}) {
    await ensureAdminAccess();

    const normalizedTitle = input.title.trim();
    if (!normalizedTitle) {
        throw new Error('Lesson title is required.');
    }

    if (!['video', 'pdf', 'text', 'quiz'].includes(input.contentType)) {
        throw new Error('Invalid lesson content type.');
    }

    if ((input.contentType === 'video' || input.contentType === 'pdf') && input.contentUrl) {
        if (!isValidHttpUrl(input.contentUrl)) {
            throw new Error('Invalid lesson asset URL detected. Please re-upload the file and try again.');
        }
    }

    const { data: lastLesson } = await supabaseAdmin
        .from('lessons')
        .select('order_index')
        .eq('module_id', input.moduleId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextOrderIndex = (lastLesson?.order_index ?? -1) + 1;

    const { data, error } = await supabaseAdmin
        .from('lessons')
        .insert({
            module_id: input.moduleId,
            course_id: input.courseId,
            title: normalizedTitle,
            content_type: input.contentType,
            content_url: input.contentUrl ?? null,
            order_index: nextOrderIndex,
            duration_seconds: 0,
            is_preview: false,
        })
        .select('*')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/admin/courses/${input.courseId}`);
    return data;
}

export async function reorderModulesAction(courseId: string, orderedModuleIds: string[]) {
    await ensureAdminAccess();

    if (!orderedModuleIds.length) return;

    const updates = orderedModuleIds.map((moduleId, index) =>
        supabaseAdmin
            .from('modules')
            .update({ order_index: index })
            .eq('id', moduleId)
            .eq('course_id', courseId)
    );

    await Promise.all(updates);
    revalidatePath(`/admin/courses/${courseId}`);
}

export async function reorderLessonsAction(courseId: string, moduleId: string, orderedLessonIds: string[]) {
    await ensureAdminAccess();

    if (!orderedLessonIds.length) return;

    const updates = orderedLessonIds.map((lessonId, index) =>
        supabaseAdmin
            .from('lessons')
            .update({ order_index: index })
            .eq('id', lessonId)
            .eq('module_id', moduleId)
    );

    await Promise.all(updates);
    revalidatePath(`/admin/courses/${courseId}`);
}

export async function togglePublishCourseAction(courseId: string) {
    await ensureAdminAccess();

    const { data: course } = await supabaseAdmin
        .from('courses')
        .select('is_published')
        .eq('id', courseId)
        .single();

    if (!course) {
        throw new Error('Course not found.');
    }

    const { error } = await supabaseAdmin
        .from('courses')
        .update({ is_published: !course.is_published })
        .eq('id', courseId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/admin/courses');
    revalidatePath('/courses');
}

export async function deleteCourseAction(courseId: string) {
    await ensureAdminAccess();

    const { error } = await supabaseAdmin
        .from('courses')
        .delete()
        .eq('id', courseId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/courses');
    redirect('/admin/courses');
}

export async function updateModuleAction(moduleId: string, courseId: string, title: string) {
    await ensureAdminAccess();

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
        throw new Error('Module title is required.');
    }

    const { error } = await supabaseAdmin
        .from('modules')
        .update({ title: normalizedTitle })
        .eq('id', moduleId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
}

export async function deleteModuleAction(moduleId: string, courseId: string) {
    await ensureAdminAccess();

    const { error } = await supabaseAdmin
        .from('modules')
        .delete()
        .eq('id', moduleId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
}

export async function updateLessonAction(
    lessonId: string,
    courseId: string,
    moduleId: string,
    payload: {
        title?: string;
        content_url?: string | null;
        content_type?: LessonContentType;
        duration_seconds?: number;
        is_preview?: boolean;
    }
) {
    await ensureAdminAccess();

    if (payload.title !== undefined) {
        const normalizedTitle = payload.title.trim();
        if (!normalizedTitle) {
            throw new Error('Lesson title is required.');
        }
        payload.title = normalizedTitle;
    }

    if (payload.content_url !== undefined) {
        if (payload.content_url && !isValidHttpUrl(payload.content_url)) {
            throw new Error('Invalid content URL.');
        }
    }

    const { error } = await supabaseAdmin
        .from('lessons')
        .update(payload)
        .eq('id', lessonId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
}

export async function deleteLessonAction(lessonId: string, courseId: string) {
    await ensureAdminAccess();

    const { error } = await supabaseAdmin
        .from('lessons')
        .delete()
        .eq('id', lessonId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
}
