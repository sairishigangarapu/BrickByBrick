'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { togglePublishCourseAction, deleteCourseAction } from '@/app/(admin)/admin/courses/actions';
import { redirect } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface CourseActionsProps {
  course: {
    id: string;
    is_published: boolean;
    title: string;
  };
  moduleCount: number;
}

export function CourseActions({ course, moduleCount }: CourseActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const handlePublish = () => {
    startTransition(async () => {
      try {
        await togglePublishCourseAction(course.id);
        toast({
          title: course.is_published ? "Course Unpublished" : "Course Published",
          description: course.is_published ? "The course is now hidden from the catalog." : "The course is now visible in the catalog.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to update course status.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCourseAction(course.id);
      } catch (error: any) {
        const isRedirectError = error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT');
        if (isRedirectError) {
          toast({
            title: "Course Deleted",
            description: "The course was successfully deleted.",
          });
          throw error;
        }
        toast({
          title: "Error",
          description: error?.message || "Failed to delete course.",
          variant: "destructive",
        });
      }
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
        <div className="text-sm space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Modules</span> 
            <span className="font-bold">{moduleCount}</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <span className={`px-2 py-1 text-xs font-bold rounded ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {course.is_published ? 'Published' : 'Draft'}
            </span>
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