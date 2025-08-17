// app/actions/upload.ts
'use server';

import { createClient } from '@supabase/supabase-js';

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const filename = formData.get('filename') as string;
    
    if (!file || !bucket || !filename) {
      return { error: 'Missing required fields: file, bucket, or filename' };
    }

    // Use service role key for admin uploads to bypass RLS, fallback to anon
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseKey = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    console.log('Upload using:', serviceRoleKey ? 'service role' : 'anon key');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Convert file to bytes for upload
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Upload to Supabase storage using service role (bypasses RLS)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { error: error.message };
    }

    console.log('Successfully uploaded file:', { bucket, filename, path: data.path });
    return { success: true, path: data.path };
  } catch (error) {
    console.error('Upload action error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}
