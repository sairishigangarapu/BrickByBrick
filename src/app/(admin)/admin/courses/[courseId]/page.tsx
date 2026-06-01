import React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import CurriculumBuilder from '@/components/admin/CurriculumBuilder';
import { Badge } from '@/components/ui/Badge';
import { CourseActions } from '@/components/admin/CourseActions';
import LessonProgressTracker from '@/components/admin/LessonProgressTracker';

export default async function CourseEditorPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;

    // 1. Fetch Course
    const { data: course } = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
        
    if (!course) redirect('/admin/courses');

    // 2. Fetch Modules & nested Lessons
    const { data: modules } = await supabaseAdmin
        .from('modules')
        .select(`
            *,
            lessons (*)
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

    // Note: Supabase nested joins don't consistently order the child table. 
    // We explicitly sort lessons here to be safe.
    const sortedModules = (modules || []).map(m => ({
        ...m,
        lessons: (m.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
    }));

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-black">{course.title}</h1>
                <Badge variant={course.is_published ? "default" : "secondary"}>
                    {course.is_published ? "Published" : "Draft"}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">Curriculum Designer</h2>
                        <CurriculumBuilder initialModules={sortedModules} courseId={course.id} />
                    </div>

                    <LessonProgressTracker courseId={course.id} modules={sortedModules} />
                </div>

                <div className="flex flex-col gap-6">
                    <CourseActions course={course} moduleCount={sortedModules.length} />
                </div>
            </div>
        </div>
    );
}
