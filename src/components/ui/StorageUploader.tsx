'use client';

import { useState, useRef } from 'react';

interface StorageUploaderProps {
  type: 'thumbnail' | 'lesson';
  folder: string;
  accept?: string;
  maxSize?: number;
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
}

export function StorageUploader({
  type,
  folder,
  accept = '*',
  maxSize = 50 * 1024 * 1024, // 50MB default
  onUploadComplete,
  onError,
}: StorageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (file.size > maxSize) {
      onError?.(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Get Signed URL from our backend
      const initRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, folder, fileName: file.name })
      });
      
      if (!initRes.ok) {
        const errData = await initRes.json();
        throw new Error(errData.error || 'Failed to initialize upload');
      }
      
      const { signedUrl, publicUrl } = await initRes.json();

      // 2. Upload directly to Supabase Storage
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Direct upload failed with status ' + xhr.status));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        
        xhr.open('PUT', signedUrl);
        // Supabase requires the Content-Type header to match the file
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      onUploadComplete(publicUrl);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        dragActive
          ? 'border-red-500 bg-red-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">Uploading... {progress}%</p>
        </div>
      ) : (
        <>
          <div className="text-4xl mb-2">📁</div>
          <p className="text-sm text-gray-600">
            Drag and drop a file here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </>
      )}
    </div>
  );
}