import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabase';

export default async function CoursesCatalogPage() {
  const { data: courses, error } = await supabaseAdmin
    .from('courses')
    .select('id, title, price, thumbnail_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-black mb-8">Course Catalog</h1>
      <p className="text-gray-600 mb-10">Browse all available courses.</p>
      {error && (
        <p className="text-red-500 mb-4">Error loading courses: {error.message}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {courses?.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
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
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="text-lg font-bold text-blue-600">
                ${course.price?.toFixed(2) || '0.00'}
              </p>
            </div>
          </Link>
        ))}
        {(!courses || courses.length === 0) && !error && (
          <p className="text-gray-500">No courses available yet.</p>
        )}
      </div>
    </div>
  );
}