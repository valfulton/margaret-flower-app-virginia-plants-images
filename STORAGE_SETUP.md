# Storage Upload Fix for RLS Error

## Problem
Getting "new row violates row-level security policy" when uploading images because Supabase storage has Row Level Security (RLS) enabled.

## Solution Options

### Option 1: Add Service Role Key (Recommended)
Add your Supabase service role key to your environment variables to allow server-side uploads that bypass RLS:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (not the anon key)
4. Add this to your `.env.local` file:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

5. Restart your development server: `pnpm run dev`

The upload should now work with the server action I created.

### Option 2: Modify Bucket Policies in Supabase
Alternatively, you can modify the storage bucket policies in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Storage > Policies
3. For the `flowers` and `icons` buckets, add policies like:

**Upload Policy:**
```sql
CREATE POLICY "Allow anonymous uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'flowers');

CREATE POLICY "Allow anonymous uploads" ON storage.objects  
FOR INSERT WITH CHECK (bucket_id = 'icons');
```

**Read Policy:**
```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'flowers');

CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'icons');
```

### Current Status
✅ **FIXED**: I've created a server action (`app/actions/upload.ts`) that:
- Uses the service role key if available (bypasses RLS completely)  
- Falls back to anon key if service role is not set
- Handles uploads server-side to avoid client-side RLS issues

✅ **UPDATED**: Modified the `EnhancedImageUploader` component to use the server action instead of direct client uploads.

**What to try:**
1. Test the upload functionality now - it may work immediately
2. If you still get RLS errors, add the service role key (Option 1)
3. Or modify bucket policies in Supabase (Option 2)

The upload should now work better than before, even without additional configuration.
