"use client";

import React, { useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StorageUploader } from '@/components/ui/StorageUploader';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Play, Pencil, Trash2, Check, X } from 'lucide-react';

import TiptapEditor from '@/components/admin/TiptapEditor';
import {
  createLessonAction,
  createModuleAction,
  reorderLessonsAction,
  reorderModulesAction,
  deleteModuleAction,
  deleteLessonAction,
  updateModuleAction,
  updateLessonAction,
} from '@/app/(admin)/admin/courses/actions';

type LessonContentType = 'video' | 'pdf' | 'text' | 'quiz';

type Lesson = {
  id: string;
  title: string;
  order_index: number;
  content_type: LessonContentType;
  content_url: string | null;
};

type Module = {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
};

type NewLessonDraft = {
  title: string;
  contentType: LessonContentType;
  contentUrl: string;
};

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveUploadedFileUrl(file: any) {
  if (!file) return '';

  const serverDataUrl = file?.serverData?.url;
  
  if (typeof serverDataUrl === 'string') {
    if (serverDataUrl.includes('ingest.uploadthing.com')) {
      const urlObj = new URL(serverDataUrl);
      const pathname = urlObj.pathname;
      const key = pathname.split('/').pop();
      if (key) return `https://utfs.io/f/${key}`;
    }
    if (isValidHttpUrl(serverDataUrl)) {
      return serverDataUrl;
    }
  }

  const ufsUrl = file?.ufsUrl;
  if (typeof ufsUrl === 'string' && isValidHttpUrl(ufsUrl)) {
    return ufsUrl;
  }

  const appUrl = file?.appUrl;
  if (typeof appUrl === 'string' && isValidHttpUrl(appUrl)) {
    return appUrl;
  }

  return '';
}

function SortableModule({
  module,
  children,
  onEdit,
  onDelete,
  isEditing,
  editingTitle,
  onEditingTitleChange,
  onSaveEdit,
  onCancelEdit,
}: {
  module: Module;
  children: React.ReactNode;
  onEdit: (moduleId: string) => void;
  onDelete: (moduleId: string) => void;
  isEditing?: boolean;
  editingTitle?: string;
  onEditingTitleChange?: (title: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `module:${module.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="bg-gray-50 border border-gray-200 p-4"
    >
      <div className="flex items-center justify-between mb-4 font-bold">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-black cursor-grab active:cursor-grabbing"
            aria-label="Reorder module"
            type="button"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editingTitle}
                onChange={(e) => onEditingTitleChange?.(e.target.value)}
                className="h-8 w-64"
                autoFocus
              />
              <button
                onClick={onSaveEdit}
                className="p-1 text-green-600 hover:text-green-700"
                aria-label="Save module"
                type="button"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Cancel edit"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span>Module: {module.title}</span>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(module.id)}
              className="p-1 text-gray-400 hover:text-blue-600"
              aria-label="Edit module"
              type="button"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(module.id)}
              className="p-1 text-gray-400 hover:text-red-600"
              aria-label="Delete module"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function SortableLesson({ 
  lesson,
  onEdit,
  onDelete,
  isEditing,
  editingTitle,
  onEditingTitleChange,
  onSaveEdit,
  onCancelEdit,
}: { 
  lesson: Lesson;
  onEdit: (lessonId: string) => void;
  onDelete: (lessonId: string) => void;
  isEditing?: boolean;
  editingTitle?: string;
  onEditingTitleChange?: (title: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `lesson:${lesson.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center justify-between bg-white border border-gray-200 p-3 text-sm"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-black cursor-grab active:cursor-grabbing"
          aria-label="Reorder lesson"
          type="button"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <Play className="w-4 h-4 text-brand-primary" />
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={editingTitle}
              onChange={(e) => onEditingTitleChange?.(e.target.value)}
              className="h-6 text-sm w-48"
              autoFocus
            />
            <button
              onClick={onSaveEdit}
              className="p-0.5 text-green-600 hover:text-green-700"
              aria-label="Save lesson"
              type="button"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-0.5 text-gray-400 hover:text-gray-600"
              aria-label="Cancel edit"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <span>{lesson.title}</span>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-gray-500 mr-2">{lesson.content_type}</span>
          <button
            onClick={() => onEdit(lesson.id)}
            className="p-1 text-gray-400 hover:text-blue-600"
            aria-label="Edit lesson"
            type="button"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(lesson.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            aria-label="Delete lesson"
            type="button"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function CurriculumBuilder({
  initialModules,
  courseId,
}: {
  initialModules: Module[];
  courseId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadDebug, setUploadDebug] = useState<string | null>(null);
  
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState('');
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  const [lessonDrafts, setLessonDrafts] = useState<Record<string, NewLessonDraft>>(() => {
    const initial: Record<string, NewLessonDraft> = {};
    for (const module of initialModules) {
      initial[module.id] = {
        title: '',
        contentType: 'video',
        contentUrl: '',
      };
    }
    return initial;
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const moduleIds = useMemo(() => modules.map((m) => `module:${m.id}`), [modules]);

  async function handleAddModule() {
    const title = newModuleTitle.trim();
    if (!title) {
      setFormError('Please enter a module title.');
      return;
    }

    setFormError(null);

    startTransition(async () => {
      try {
        const newModule = await createModuleAction(courseId, title);

        setModules((prev) => [
          ...prev,
          {
            ...newModule,
            lessons: [],
          },
        ]);
        setLessonDrafts((prev) => ({
          ...prev,
          [newModule.id]: { title: '', contentType: 'video', contentUrl: '' },
        }));
        setNewModuleTitle('');
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Failed to add module.');
      }
    });
  }

  async function handleAddLesson(moduleId: string) {
    const draft = lessonDrafts[moduleId];
    const title = draft?.title?.trim() || '';

    if (!title) {
      setFormError('Please enter a lesson title.');
      return;
    }

    if ((draft.contentType === 'video' || draft.contentType === 'pdf' || draft.contentType === 'text') && !draft.contentUrl.trim()) {
      setFormError(`Please add content for this ${draft.contentType} lesson.`);
      return;
    }

    setFormError(null);

    startTransition(async () => {
      try {
        const lesson = await createLessonAction({
          courseId,
          moduleId,
          title,
          contentType: draft.contentType,
          contentUrl: draft.contentUrl || null,
        });

        setModules((prev) =>
          prev.map((module) =>
            module.id === moduleId
              ? { ...module, lessons: [...module.lessons, lesson].sort((a, b) => a.order_index - b.order_index) }
              : module
          )
        );

        setLessonDrafts((prev) => ({
          ...prev,
          [moduleId]: { ...prev[moduleId], title: '', contentUrl: '' },
        }));
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Failed to add lesson.');
      }
    });
  }

  function handleEditModule(moduleId: string) {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setEditingModuleId(moduleId);
      setEditingModuleTitle(module.title);
    }
  }

  async function handleSaveModule(moduleId: string) {
    if (!editingModuleTitle.trim()) {
      setFormError('Module title cannot be empty.');
      return;
    }

    startTransition(async () => {
      try {
        await updateModuleAction(moduleId, courseId, editingModuleTitle);
        setModules(prev => prev.map(m => 
          m.id === moduleId ? { ...m, title: editingModuleTitle } : m
        ));
        setEditingModuleId(null);
        setEditingModuleTitle('');
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Failed to update module.');
      }
    });
  }

  function handleCancelEditModule() {
    setEditingModuleId(null);
    setEditingModuleTitle('');
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm('Are you sure you want to delete this module? All lessons in this module will be deleted.')) {
      return;
    }

    setDeletingModuleId(moduleId);
    startTransition(async () => {
      try {
        await deleteModuleAction(moduleId, courseId);
        setModules(prev => prev.filter(m => m.id !== moduleId));
        setDeletingModuleId(null);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Failed to delete module.');
        setDeletingModuleId(null);
      }
    });
  }

  function handleEditLesson(lessonId: string) {
    for (const module of modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setEditingLessonId(lessonId);
        setEditingLessonTitle(lesson.title);
        break;
      }
    }
  }

  async function handleSaveLesson(lessonId: string) {
    if (!editingLessonTitle.trim()) {
      setFormError('Lesson title cannot be empty.');
      return;
    }

    startTransition(async () => {
      try {
        await updateLessonAction(lessonId, courseId, '', { title: editingLessonTitle });
        setModules(prev => prev.map(m => ({
          ...m,
          lessons: m.lessons.map(l => 
            l.id === lessonId ? { ...l, title: editingLessonTitle } : l
          )
        })));
        setEditingLessonId(null);
        setEditingLessonTitle('');
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Failed to update lesson.');
      }
    });
  }

  function handleCancelEditLesson() {
    setEditingLessonId(null);
    setEditingLessonTitle('');
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    setDeletingLessonId(lessonId);
    startTransition(async () => {
      try {
        await deleteLessonAction(lessonId, courseId);
        setModules(prev => prev.map(m => ({
          ...m,
          lessons: m.lessons.filter(l => l.id !== lessonId)
        })));
        setDeletingLessonId(null);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Failed to delete lesson.');
        setDeletingLessonId(null);
      }
    });
  }

  function updateLessonDraft(moduleId: string, patch: Partial<NewLessonDraft>) {
    const existing = lessonDrafts[moduleId] || {
      title: '',
      contentType: 'video' as LessonContentType,
      contentUrl: '',
    };

    setLessonDrafts((prev) => ({
      ...prev,
      [moduleId]: {
        ...existing,
        ...patch,
      },
    }));
  }

  function parseId(raw: string) {
    const [kind, id] = raw.split(':');
    return { kind, id };
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeParsed = parseId(String(active.id));
    const overParsed = parseId(String(over.id));

    if (activeParsed.kind === 'module' && overParsed.kind === 'module') {
      setModules((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeParsed.id);
        const newIndex = items.findIndex((i) => i.id === overParsed.id);
        const reordered = arrayMove(items, oldIndex, newIndex).map((m, idx) => ({ ...m, order_index: idx }));

        startTransition(async () => {
          try {
            await reorderModulesAction(courseId, reordered.map((m) => m.id));
          } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Failed to reorder modules.');
          }
        });

        return reordered;
      });
    }
  }

  function handleLessonDragEnd(moduleId: string, event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeParsed = parseId(String(active.id));
    const overParsed = parseId(String(over.id));

    if (activeParsed.kind === 'lesson' && overParsed.kind === 'lesson') {
      setModules((items) => {
        const next = items.map((m) => {
          if (m.id !== moduleId) return m;

          const oldIndex = m.lessons.findIndex((l) => l.id === activeParsed.id);
          const newIndex = m.lessons.findIndex((l) => l.id === overParsed.id);
          const reorderedLessons = arrayMove(m.lessons, oldIndex, newIndex).map((l, idx) => ({
            ...l,
            order_index: idx,
          }));

          startTransition(async () => {
            try {
              await reorderLessonsAction(courseId, moduleId, reorderedLessons.map((l) => l.id));
            } catch (error) {
              setFormError(error instanceof Error ? error.message : 'Failed to reorder lessons.');
            }
          });

          return { ...m, lessons: reorderedLessons };
        });

        return next;
      });
    }
  }

  return (
    <div className="space-y-4">
      {modules.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 text-sm text-gray-500">
          No modules added. Build your curriculum starting with your first module.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {modules.map((module) => {
                const draft = lessonDrafts[module.id] || {
                  title: '',
                  contentType: 'video' as LessonContentType,
                  contentUrl: '',
                };

                return (
                  <SortableModule 
                    key={module.id} 
                    module={module}
                    onEdit={handleEditModule}
                    onDelete={handleDeleteModule}
                    isEditing={editingModuleId === module.id}
                    editingTitle={editingModuleId === module.id ? editingModuleTitle : ''}
                    onEditingTitleChange={setEditingModuleTitle}
                    onSaveEdit={() => handleSaveModule(module.id)}
                    onCancelEdit={handleCancelEditModule}
                  >
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleLessonDragEnd(module.id, event)}>
                      <SortableContext
                        items={module.lessons.map((lesson) => `lesson:${lesson.id}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2 pl-8">
                          {module.lessons.map((lesson) => (
                            <SortableLesson 
                              key={lesson.id} 
                              lesson={lesson}
                              onEdit={handleEditLesson}
                              onDelete={handleDeleteLesson}
                              isEditing={editingLessonId === lesson.id}
                              editingTitle={editingLessonId === lesson.id ? editingLessonTitle : ''}
                              onEditingTitleChange={setEditingLessonTitle}
                              onSaveEdit={() => handleSaveLesson(lesson.id)}
                              onCancelEdit={handleCancelEditLesson}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    <div className="mt-4 border-t border-gray-200 pt-4 pl-8 space-y-3">
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold">Add Lesson</h4>

                      <Input
                        placeholder="Lesson title"
                        value={draft.title}
                        onChange={(event) => updateLessonDraft(module.id, { title: event.target.value })}
                      />

                      <select
                        className="h-10 w-full border border-gray-300 bg-white px-3 text-sm"
                        value={draft.contentType}
                        onChange={(event) => updateLessonDraft(module.id, {
                          contentType: event.target.value as LessonContentType,
                          contentUrl: '',
                        })}
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="text">Text (Tiptap)</option>
                        <option value="quiz">Quiz</option>
                      </select>

                      {(draft.contentType === 'video' || draft.contentType === 'pdf') && (
                        <div>
                          <StorageUploader
                            type="lesson"
                            folder={`courses/${courseId}/${module.id}`}
                            accept={draft.contentType === 'video' ? 'video/*' : 'application/pdf'}
                            onUploadComplete={(url) => {
                              setFormError(null);
                              updateLessonDraft(module.id, { contentUrl: url });
                            }}
                            onError={(error) => {
                              setFormError(error || 'Lesson file upload failed.');
                            }}
                          />
                          {draft.contentUrl ? (
                            <p className="text-xs text-emerald-700 mt-2">File uploaded successfully.</p>
                          ) : null}
                        </div>
                      )}

                      {draft.contentType === 'text' && (
                        <div>
                          <TiptapEditor
                            content={draft.contentUrl}
                            onChange={(html) => updateLessonDraft(module.id, { contentUrl: html })}
                          />
                          <p className="text-xs text-gray-500 mt-2">The rich text content will be saved in Supabase.</p>
                        </div>
                      )}

                      {draft.contentType === 'quiz' && (
                        <p className="text-xs text-gray-500">
                          Quiz placeholders are supported. You can attach quiz logic in a later step.
                        </p>
                      )}

                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleAddLesson(module.id)}
                        disabled={isPending}
                        type="button"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Save Lesson
                      </Button>
                    </div>
                  </SortableModule>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="New Module Title..."
          className="flex-1"
          value={newModuleTitle}
          onChange={(event) => setNewModuleTitle(event.target.value)}
        />
        <Button onClick={handleAddModule} disabled={isPending} type="button">
          Add Module
        </Button>
      </div>

      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      {uploadDebug ? (
        <div className="border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-bold uppercase tracking-wider mb-2">Upload Debug</p>
          <pre className="whitespace-pre-wrap break-all">{uploadDebug}</pre>
        </div>
      ) : null}
    </div>
  );
}
