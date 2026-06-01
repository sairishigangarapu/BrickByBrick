'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { togglePublishCourseAction, deleteCourseAction } from '@/app/(admin)/admin/courses/actions';
import { redirect } from 'next/navigation';

interface CourseActionsProps {
  course: {
    id: string;
    is_published: boolean;
    is_paid: boolean;
    price: number | null;
    title: string;
  };
  moduleCount: number;
}

export function CourseActions({ course, moduleCount }: CourseActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePublish = () => {
    startTransition(async () => {
      await togglePublishCourseAction(course.id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCourseAction(course.id);
    });
  };

  return (
    <>
      <div className="bg-brand-surface p-6 border border-gray-200">
        <h3 className="font-bold uppercase tracking-widest text-xs mb-4">Course Actions</h3>
        <div className="space-y-3">
          <Button 
            className="w-full" 
            variant={course.is_published ? "outline" : "default"}
            onClick={handlePublish}
            disabled={isPending}
          >
            {course.is_published ? "Unpublish Course" : "Publish to Catalog"}
          </Button>
          <Button 
            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700" 
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Course
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-6 border border-gray-200">
        <h3 className="font-bold uppercase tracking-widest text-xs mb-4">Quick Stats</h3>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Pricing</span> 
            <span className="font-bold">{course.is_paid ? `$${Number(course.price ?? 0).toFixed(2)}` : 'Free'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Modules</span> 
            <span className="font-bold">{moduleCount}</span>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-bold mb-2">Delete Course?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete &quot;{course.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}