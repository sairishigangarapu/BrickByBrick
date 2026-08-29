'use client';

import { useState, useTransition } from 'react';
import { Check, Circle, FileText, HelpCircle, Play } from 'lucide-react';

import { markLessonCompleteAction } from '@/app/student-portal/actions';

interface ModuleRow {
  id: string;
  title: string;
  order_index: number;
}

interface LessonRow {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  content_type: 'video' | 'pdf' | 'text' | 'quiz';
  content_url: string | null;
  order_index: number;
}

interface Props {
  modules: ModuleRow[];
  lessons: LessonRow[];
  completedLessonIds: string[];
  isEnrolled: boolean;
}

function lessonIcon(type: LessonRow['content_type']) {
  switch (type) {
    case 'video':
      return <Play className="w-4 h-4" aria-hidden="true" />;
    case 'pdf':
      return <FileText className="w-4 h-4" aria-hidden="true" />;
    case 'text':
      return <FileText className="w-4 h-4" aria-hidden="true" />;
    case 'quiz':
      return <HelpCircle className="w-4 h-4" aria-hidden="true" />;
  }
}

export function CourseLessonList({ modules, lessons, completedLessonIds, isEnrolled }: Props) {
  const initial = new Set(completedLessonIds);
  const [completed, setCompleted] = useState<Set<string>>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const grouped = modules.length
    ? modules.map((m) => ({
        module: m,
        lessons: lessons.filter((l) => l.module_id === m.id),
      }))
    : [
        {
          module: { id: 'uncategorized', title: 'Lessons', order_index: 0 },
          lessons,
        },
      ];

  const handleToggle = (lessonId: string, courseId: string) => {
    if (!isEnrolled || pending) return;
    setError(null);

    // Optimistic update
    const wasCompleted = completed.has(lessonId);
    setCompleted((prev) => {
      const next = new Set(prev);
      if (wasCompleted) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });

    startTransition(async () => {
      try {
        await markLessonCompleteAction(lessonId, courseId);
      } catch (e) {
        // Roll back optimistic update
        setCompleted((prev) => {
          const next = new Set(prev);
          if (wasCompleted) next.add(lessonId);
          else next.delete(lessonId);
          return next;
        });
        setError(e instanceof Error ? e.message : 'Could not update progress.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {grouped.map(({ module, lessons: groupLessons }) => (
        <div key={module.id} className="border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200">
            <h3 className="text-sm font-black uppercase tracking-wider">{module.title}</h3>
          </div>
          <ul className="divide-y divide-zinc-100">
            {groupLessons.length === 0 ? (
              <li className="px-5 py-3 text-sm text-zinc-500">No lessons in this module yet.</li>
            ) : (
              groupLessons.map((lesson) => {
                const isDone = completed.has(lesson.id);
                return (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-zinc-500">{lessonIcon(lesson.content_type)}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDone ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                          {lesson.content_type}
                        </p>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <button
                        type="button"
                        onClick={() => handleToggle(lesson.id, lesson.course_id)}
                        disabled={pending && !isDone}
                        aria-label={isDone ? 'Mark lesson incomplete' : 'Mark lesson complete'}
                        className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-zinc-300 text-zinc-400 hover:border-emerald-600 hover:text-emerald-600'
                        } ${pending ? 'opacity-60' : ''}`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Enroll to track</span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
