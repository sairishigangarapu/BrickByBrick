import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function CoursesCatalogPage() {
  const { data: courses, error } = await supabaseAdmin
    .from('courses')
    .select('id, title, thumbnail_url, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const { userId } = await auth();
  let enrolledIds = new Set<string>();
  let enrollmentProgress: Record<string, { progress_percent: number; is_completed: boolean }> = {};

  if (userId) {
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .maybeSingle();

    if (dbUser) {
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('course_id, progress_percent, is_completed')
        .eq('user_id', dbUser.id);

      for (const e of enrollments ?? []) {
        enrolledIds.add(e.course_id);
        enrollmentProgress[e.course_id] = {
          progress_percent: e.progress_percent ?? 0,
          is_completed: e.is_completed ?? false,
        };
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-black mb-2">Course Catalog</h1>
      <p className="text-gray-600 mb-10">Browse all available courses.</p>

      {error && (
        <p className="text-red-500 mb-4">Error loading courses: {error.message}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(courses ?? []).map((course) => {
          const enrollment = enrollmentProgress[course.id];
          const isEnrolled = enrolledIds.has(course.id);
          const isCompleted = enrollment?.is_completed;
          return (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              {isEnrolled && (
                <span
                  className={`absolute top-2 right-2 z-10 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-orange-600 text-white'
                  }`}
                >
                  {isCompleted ? 'Completed' : `${enrollment?.progress_percent ?? 0}%`}
                </span>
              )}
              {course.thumbnail_url ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h2>
                {isEnrolled && enrollment && !isCompleted && (
                  <div className="mt-2 h-1.5 bg-zinc-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-orange-600"
                      style={{ width: `${Math.min(100, Math.max(0, enrollment.progress_percent))}%` }}
                    />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {(!courses || courses.length === 0) && !error && (
          <p className="text-gray-500">No courses available yet.</p>
        )}
      </div>
    </div>
  );
}
