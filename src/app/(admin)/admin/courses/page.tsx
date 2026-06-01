import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { supabaseAdmin } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';

async function getCourses() {
  const { data } = await supabaseAdmin
    .from('courses')
    .select('id, title, is_published, created_at')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function AdminCoursesPage() {
  const courses = await getCourses();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Course Manager</h1>
        <Link href="/admin/courses/new">
          <Button>Create New Course</Button>
        </Link>
      </div>
      <div className="bg-white border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-brand-surface border-b border-gray-200 uppercase text-xs tracking-wider text-gray-500">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={4}>No courses created.</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium">{course.title}</td>
                  <td className="p-4">
                    <Badge variant={course.is_published ? "default" : "secondary"}>
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
