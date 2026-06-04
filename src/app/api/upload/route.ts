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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bucketName = type === 'thumbnail' ? 'course-thumbnails' : 'lesson-content';
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}