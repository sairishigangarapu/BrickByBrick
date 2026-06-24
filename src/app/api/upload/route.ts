import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

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
    const { type, folder, fileName } = body;

    if (!fileName) {
      return NextResponse.json({ error: 'No file name provided' }, { status: 400 });
    }

    const bucketName = type === 'thumbnail' ? 'course-thumbnails' : 'lesson-content';
    const path = `${folder}/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    
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
    });
  } catch (error) {
    console.error("General Upload Error:", error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}