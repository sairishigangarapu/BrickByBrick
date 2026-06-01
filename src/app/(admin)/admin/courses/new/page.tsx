"use client";

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { StorageUploader } from '@/components/ui/StorageUploader';

import TiptapEditor from '@/components/admin/TiptapEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createCourseAction } from '../actions';

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
  const [pricingMode, setPricingMode] = useState<'free' | 'paid'>("free");
  const [priceValue, setPriceValue] = useState("49.00");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const isPaid = pricingMode === 'paid';
    const price = isPaid ? parseFloat(priceValue || "0") : 0;

    if (isPaid && (!Number.isFinite(price) || price <= 0)) {
        setFormError("Paid courses need a price above $0.");
        return;
    }

    setFormError(null);
    startTransition(async () => {
        try {
            await createCourseAction({
                title,
                description,
                price,
                isPaid,
                thumbnailUrl: thumbnailUrl ?? undefined,
            });
        } catch(error: any) {
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
                <div>
                    <label className="block text-sm font-bold tracking-widest uppercase mb-2">Pricing Mode</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <Button
                            type="button"
                            variant={pricingMode === 'free' ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => setPricingMode('free')}
                        >
                            Free Course
                        </Button>
                        <Button
                            type="button"
                            variant={pricingMode === 'paid' ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => setPricingMode('paid')}
                        >
                            Paid Course
                        </Button>
                    </div>
                    <label className="block text-sm font-bold tracking-widest uppercase mb-2">Price ($)</label>
                    <Input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceValue}
                        onChange={(event) => setPriceValue(event.target.value)}
                        disabled={pricingMode === 'free'}
                        required={pricingMode === 'paid'}
                        placeholder="99.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {pricingMode === 'free'
                            ? 'Learners can enroll without payment.'
                            : 'Set the one-time purchase price.'}
                    </p>
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
