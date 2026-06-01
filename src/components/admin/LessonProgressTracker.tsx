'use client';

import { useEffect, useState } from 'react';
import { getAllUsersProgress } from '@/app/actions/lesson-progress';
import { CheckCircle, Circle } from 'lucide-react';

interface ProgressData {
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  users: {
    full_name: string;
    email: string;
  };
  lessons: {
    title: string;
    module_id: string;
  };
}

interface Module {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
  }>;
}

interface LessonProgressTrackerProps {
  courseId: string;
  modules: Module[];
}

export default function LessonProgressTracker({ courseId, modules }: LessonProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      const result = await getAllUsersProgress(courseId);
      if (result.success) {
        setProgress(result.progress as ProgressData[]);
      }
      setLoading(false);
    }
    loadProgress();
  }, [courseId]);

  if (loading) {
    return (
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Student Progress</h2>
        <div className="text-gray-500">Loading progress data...</div>
      </div>
    );
  }

  // Group progress by user
  const userProgress = progress.reduce((acc, item) => {
    const userId = item.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: item.users,
        completedLessons: [],
      };
    }
    if (item.is_completed) {
      acc[userId].completedLessons.push(item.lesson_id);
    }
    return acc;
  }, {} as Record<string, { user: { full_name: string; email: string }; completedLessons: string[] }>);

  const users = Object.entries(userProgress);
  const allLessons = modules.flatMap(m => m.lessons);

  if (users.length === 0) {
    return (
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Student Progress</h2>
        <div className="text-gray-500">No students enrolled yet.</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Student Progress</h2>
      
      <div className="space-y-6">
        {users.map(([userId, data]) => {
          const completionRate = (data.completedLessons.length / allLessons.length) * 100;
          
          return (
            <div key={userId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{data.user.full_name || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-500">{data.user.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(completionRate)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.completedLessons.length} / {allLessons.length} lessons
                  </div>
                </div>
              </div>

              {/* Progress by module */}
              <div className="space-y-3">
                {modules.map(module => {
                  const moduleLessons = module.lessons;
                  const completedInModule = moduleLessons.filter(l => 
                    data.completedLessons.includes(l.id)
                  ).length;

                  return (
                    <div key={module.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-700">{module.title}</h4>
                        <span className="text-xs text-gray-500">
                          {completedInModule} / {moduleLessons.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {moduleLessons.map(lesson => {
                          const isCompleted = data.completedLessons.includes(lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                              title={lesson.title}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Circle className="w-3 h-3" />
                              )}
                              <span className="truncate max-w-[150px]">{lesson.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
