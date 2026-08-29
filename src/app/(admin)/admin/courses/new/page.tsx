"use client";

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { StorageUploader } from '@/components/ui/StorageUploader';

import TiptapEditor from '@/components/admin/TiptapEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createCourseAction } from '../actions';
import { useToast } from '@/hooks/use-toast';

function isValidHttpUrl(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export default function AdminNewCoursePage() {
  const [isPending, startTransition] = useTransition();
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    setFormError(null);
    startTransition(async () => {
        try {
            await createCourseAction({
                title,
                description,
                thumbnailUrl: thumbnailUrl ?? undefined,
            });
        } catch(error: any) {
            const isRedirectError = error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT');
            if (isRedirectError) {
                toast({
                    title: "Course Created",
                    description: "The course was successfully created.",
                });
                throw error;
            }
            toast({
                title: "Error",
                description: error?.message || "Failed to create course.",
                variant: "destructive",
            });
            setFormError(error?.message || "Failed to create course. Ensure database constraints are met.");
        }
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Create New Course</h1>
      <div className="bg-white border border-gray-200 p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold tracking-widest uppercase mb-2">Course Title</label>
                <Input name="title" required placeholder="Advanced System Design" className="text-lg" />
            </div>
            
            <div>
                <label className="block text-sm font-bold tracking-widest uppercase mb-2">Description</label>
                <TiptapEditor content={description} onChange={setDescription} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold tracking-widest uppercase mb-2">Course Thumbnail</label>
                    {thumbnailUrl ? (
                        <div className="border border-gray-200 p-3 bg-white">
                            <div className="relative w-full aspect-video overflow-hidden border border-gray-100">
                                <Image src={thumbnailUrl} alt="Course thumbnail" fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" />
                            </div>
                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                <span>Stored via Supabase</span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setThumbnailUrl(null)}>Replace</Button>
                            </div>
                        </div>
                    ) : (
                        <StorageUploader
                            type="thumbnail"
                            folder="courses"
                            accept="image/png, image/jpeg"
                            maxSize={4 * 1024 * 1024}
                            onUploadComplete={(url) => {
                                setFormError(null);
                                setThumbnailUrl(url);
                            }}
                            onError={(error) => {
                                setFormError(error || 'Thumbnail upload failed.');
                            }}
                        />
                    )}
                    <p className="text-xs text-gray-400 mt-2">PNG or JPG up to 4MB.</p>
                </div>
            </div>

            {formError && (
                <p className="text-sm text-red-600" role="alert">{formError}</p>
            )}

            <Button size="lg" type="submit" disabled={isPending} className="w-full">
                {isPending ? "Creating..." : "Generate Course & Edit Curriculum"}
            </Button>
        </form>
      </div>
    </div>
  );
}
