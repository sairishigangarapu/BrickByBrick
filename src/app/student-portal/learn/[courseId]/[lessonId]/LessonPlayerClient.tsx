'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, Menu, X, ChevronRight } from 'lucide-react';
import PDFViewer from '@/components/learn/PDFViewer';
import { toggleLessonCompletion } from '@/app/actions/lesson-progress';

interface Lesson {
  id: string;
  title: string;
  content_type: string;
  content_url: string;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface LessonPlayerClientProps {
  initialLesson: Lesson;
  initialModules: Module[];
  courseId: string;
  courseName: string;
  initialCompletedLessons: string[];
}

function LessonContent({ lesson }: { lesson: Lesson }) {
  if (lesson.content_type === 'pdf') {
    if (!lesson.content_url) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-600 p-8">
            <p className="text-lg font-medium">No PDF uploaded</p>
            <p className="text-sm mt-2">This lesson doesn't have content yet.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full bg-gray-100">
        <PDFViewer url={lesson.content_url} title={lesson.title} />
      </div>
    );
  }
  
  if (lesson.content_type === 'video') {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        {lesson.content_url ? (
          <video 
            src={lesson.content_url} 
            controls 
            className="w-full h-full"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="text-white text-center p-8">
            <p className="text-lg">No video uploaded yet</p>
          </div>
        )}
      </div>
    );
  }
  
  if (lesson.content_type === 'text') {
    return (
      <div className="w-full h-full overflow-auto bg-white p-8">
        <div 
          className="prose max-w-4xl mx-auto"
          dangerouslySetInnerHTML={{ __html: lesson.content_url || '<p>No content yet.</p>' }}
        />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center text-gray-600 p-8">
        <p className="text-lg">Unknown content type: {lesson.content_type}</p>
      </div>
    </div>
  );
}

export default function LessonPlayerClient({
  initialLesson,
  initialModules,
  courseId,
  courseName,
  initialCompletedLessons,
}: LessonPlayerClientProps) {
  const router = useRouter();
  const [currentLesson] = useState<Lesson>(initialLesson);
  const [modules] = useState<Module[]>(initialModules);
  const [completedLessons, setCompletedLessons] = useState<string[]>(initialCompletedLessons);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleCompleteLesson = async () => {
    const isCurrentlyCompleted = completedLessons.includes(currentLesson.id);
    const newCompletionState = !isCurrentlyCompleted;

    if (newCompletionState) {
      setCompletedLessons([...completedLessons, currentLesson.id]);
    } else {
      setCompletedLessons(completedLessons.filter(id => id !== currentLesson.id));
    }

    const result = await toggleLessonCompletion(currentLesson.id, courseId, newCompletionState);
    
    if (!result.success) {
      if (newCompletionState) {
        setCompletedLessons(completedLessons.filter(id => id !== currentLesson.id));
      } else {
        setCompletedLessons([...completedLessons, currentLesson.id]);
      }
    }
  };

  const navigateToLesson = (newLessonId: string) => {
    router.push(`/student-portal/learn/${courseId}/${newLessonId}`);
  };

  const allLessons = modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const isCompleted = completedLessons.includes(currentLesson.id);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Top Header */}
      <header className="bg-black border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/student-portal/dashboard')}
            className="text-white hover:text-gray-300 transition"
            title="Exit course"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-semibold text-sm">{courseName}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleCompleteLesson}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition ${
              isCompleted
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Completed
              </>
            ) : (
              'Mark as complete'
            )}
          </button>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:text-gray-300 transition p-2"
            title="Toggle course content"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video/PDF Player */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="flex-1 relative">
            <LessonContent lesson={currentLesson} />
          </div>
          
          {/* Lesson Title Bar */}
          <div className="bg-gray-900 px-6 py-4 border-t border-gray-800">
            <h2 className="text-white text-lg font-semibold">{currentLesson.title}</h2>
            <p className="text-gray-400 text-sm mt-1">
              Lesson {currentIndex + 1} of {allLessons.length}
            </p>
          </div>
        </div>

        {/* Right Sidebar - Course Content */}
        {sidebarOpen && (
          <aside className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Course content</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {modules.map((module, moduleIndex) => {
                const moduleCompleted = module.lessons.every(l => completedLessons.includes(l.id));
                const completedCount = module.lessons.filter(l => completedLessons.includes(l.id)).length;
                
                return (
                  <div key={module.id} className="border-b border-gray-200">
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">
                          Section {moduleIndex + 1}: {module.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {completedCount}/{module.lessons.length}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      {module.lessons.map((lesson) => {
                        const isActive = lesson.id === currentLesson.id;
                        const lessonCompleted = completedLessons.includes(lesson.id);
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => navigateToLesson(lesson.id)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition ${
                              isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {lessonCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${isActive ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{lesson.content_type}</p>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
