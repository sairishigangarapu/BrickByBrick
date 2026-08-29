'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { enrollInCourseAction } from '@/app/student-portal/actions';

interface Props {
  courseId: string;
  isSignedIn: boolean;
  isEnrolled: boolean;
  progressPercent: number;
  isCompleted: boolean;
}

export function CourseEnrollControls({
  courseId,
  isSignedIn,
  isEnrolled,
  progressPercent,
  isCompleted,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enrolledNow, setEnrolledNow] = useState(isEnrolled);

  const onEnroll = () => {
    setError(null);
    startTransition(async () => {
      try {
        await enrollInCourseAction(courseId);
        setEnrolledNow(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not enroll.');
      }
    });
  };

  if (!isSignedIn) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <h3 className="text-base font-black uppercase tracking-wider mb-2">Enroll in this course</h3>
        <p className="text-sm text-zinc-600 mb-4">
          Sign in to track your progress and complete lessons.
        </p>
        <Link href="/sign-in" className="block">
          <Button className="w-full">Sign in to enroll</Button>
        </Link>
      </div>
    );
  }

  if (!enrolledNow) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <h3 className="text-base font-black uppercase tracking-wider mb-2">Enroll in this course</h3>
        <p className="text-sm text-zinc-600 mb-4">
          Start tracking your progress and earning XP.
        </p>
        <Button onClick={onEnroll} disabled={pending} className="w-full">
          {pending ? 'Enrolling…' : 'Enroll'}
        </Button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-black uppercase tracking-wider">
          {isCompleted ? 'Completed' : 'In Progress'}
        </h3>
        <span className="text-sm font-bold text-zinc-600">{progressPercent}%</span>
      </div>
      <Progress value={progressPercent} />
      <p className="text-xs text-zinc-500 mt-2">
        Mark lessons as complete from the curriculum below to update your progress.
      </p>
    </div>
  );
}
