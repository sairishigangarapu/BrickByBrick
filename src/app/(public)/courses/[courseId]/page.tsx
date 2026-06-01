import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { enrollInCourseAction, checkEnrollmentStatus } from '@/app/actions/enrollment';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const { userId } = await auth();

  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error || !course) {
    notFound();
  }

  if (!course.is_published) {
    notFound();
  }

  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select(`
      id,
      title,
      order_index,
      lessons (
        id,
        title,
        content_type,
        is_preview,
        order_index
      )
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  const sortedModules = (modules || []).map(m => ({
    ...m,
    lessons: (m.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
  }));

  let isEnrolled = false;
  if (userId) {
    isEnrolled = await checkEnrollmentStatus(courseId);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {course.is_paid && (
                  <Badge variant="default">Paid Course</Badge>
                )}
                {course.difficulty && (
                  <Badge variant="secondary">{course.difficulty}</Badge>
                )}
              </div>
              <h1 className="text-4xl font-black mb-4">{course.title}</h1>
              {course.description && (
                <div 
                  className="prose prose-lg max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm sticky top-8">
                {course.thumbnail_url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-6">
                    {course.is_paid ? (
                      <p className="text-3xl font-bold text-gray-900">${course.price}</p>
                    ) : (
                      <p className="text-3xl font-bold text-green-600">Free</p>
                    )}
                  </div>
                  
                  {isEnrolled ? (
                    <Link href={`/student-portal/learn/${courseId}`} className="block">
                      <Button size="lg" className="w-full">Continue Learning</Button>
                    </Link>
                  ) : userId ? (
                    <form action={enrollInCourseAction.bind(null, courseId)}>
                      <Button size="lg" className="w-full" type="submit">
                        Enroll Now
                      </Button>
                    </form>
                  ) : (
                    <Link href="/sign-in">
                      <Button size="lg" className="w-full">Sign In to Enroll</Button>
                    </Link>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold mb-3">This course includes:</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✓ {sortedModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lessons</li>
                      <li>✓ {sortedModules.length} modules</li>
                      {course.is_paid ? '✓ Full lifetime access' : '✓ Free access'}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
          
          {sortedModules.length === 0 ? (
            <p className="text-gray-500">No curriculum available yet.</p>
          ) : (
            <div className="space-y-4">
              {sortedModules.map((module, moduleIndex) => (
                <div key={module.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-lg">
                      Module {moduleIndex + 1}: {module.title}
                    </h3>
                    <p className="text-sm text-gray-500">{module.lessons?.length || 0} lessons</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {module.lessons?.map((lesson: any, lessonIndex: number) => (
                      <div key={lesson.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm">{lessonIndex + 1}.</span>
                          <span className="text-gray-700">{lesson.title}</span>
                          {lesson.is_preview && (
                            <Badge variant="outline" className="text-xs">Preview</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs uppercase tracking-wider text-gray-500">
                            {lesson.content_type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}