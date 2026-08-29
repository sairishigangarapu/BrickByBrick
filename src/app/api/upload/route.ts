import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// MIME type whitelist per security guide requirements
const IMAGE_WHITELIST = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
const PDF_WHITELIST = ['application/pdf'];
const VIDEO_WHITELIST = ['video/mp4', 'video/webm', 'video/quicktime'];
const DOCUMENT_WHITELIST = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Max file sizes per security guide
const MAX_FILE_SIZES = {
  logo: 4 * 1024 * 1024, // 4MB (unified with UI)
  banner: 5 * 1024 * 1024, // 5MB
  pdf: 10 * 1024 * 1024, // 10MB
  video: 500 * 1024 * 1024, // 500MB
  default: 50 * 1024 * 1024, // 50MB
};

function getMaxSize(type: string): number {
  switch (type) {
    case 'logo':
    case 'thumbnail':
      return MAX_FILE_SIZES.logo;
    case 'banner':
      return MAX_FILE_SIZES.banner;
    case 'pdf':
    case 'brochure':
    case 'lesson-pdf':
      return MAX_FILE_SIZES.pdf;
    case 'lesson-video':
      return MAX_FILE_SIZES.video;
    default:
      return MAX_FILE_SIZES.default;
  }
}

function getMimeWhitelist(type: string): string[] {
  switch (type) {
    case 'logo':
    case 'thumbnail':
    case 'banner':
      return IMAGE_WHITELIST;
    case 'pdf':
    case 'brochure':
    case 'lesson-pdf':
      return PDF_WHITELIST;
    case 'lesson-video':
      return VIDEO_WHITELIST;
    default:
      return [...IMAGE_WHITELIST, ...PDF_WHITELIST];
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (clerkUser?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { type, folder, fileName, fileType, fileSize } = body;

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json({ error: 'Missing required fields: fileName, fileType, fileSize' }, { status: 400 });
    }

    // Validate MIME type whitelist
    const whitelist = getMimeWhitelist(type);
    if (!whitelist.includes(fileType)) {
      const allowedTypes = whitelist.join(', ');
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes}` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = getMaxSize(type);
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate filename - prevent path traversal
    const sanitizedFileName = fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    if (!sanitizedFileName || sanitizedFileName === '.') {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    let bucketName: string;
    if (['logo', 'thumbnail', 'banner'].includes(type)) {
      bucketName = 'course-thumbnails';
    } else if (type === 'lesson-video' || type === 'lesson-pdf' || type === 'pdf' || type === 'brochure') {
      bucketName = 'lesson-content';
    } else {
      bucketName = 'lesson-content';
    }

    const path = `${folder}/${Date.now()}-${sanitizedFileName}`;

    // Create signed upload URL
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUploadUrl(path);

    if (error) {
      console.error("Supabase Signed URL Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get the deterministic public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      publicUrl: urlData.publicUrl,
      path: path,
      mimeType: fileType,
    });
  } catch (error) {
    console.error("General Upload Error:", error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}