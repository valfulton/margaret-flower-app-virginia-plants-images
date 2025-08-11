// components/admin/image-uploader.tsx
'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRef, useState } from 'react';

interface Props {
  currentName: string | null;
  onUploaded: (fileName: string) => void;
}

const MAX_BYTES = 1_500_000; // 1.5MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

function slugify(x: string) {
  return x.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export default function ImageUploader({ currentName, onUploaded }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED.includes(f.type)) return setMsg('Only JPG, PNG, or WebP allowed.');
    if (f.size > MAX_BYTES) return setMsg('Image is too large (>1.5MB).');

    const ext = f.name.split('.').pop()?.toLowerCase() || 'jpg';
    const base = slugify(f.name.replace(/\.[^.]+$/, ''));
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const filename = `${base}_${stamp}.${ext}`;

    setBusy(true);
    setMsg(null);
    try {
      const { error } = await supabase.storage.from('flowers').upload(filename, f, {
        upsert: false,
        contentType: f.type,
      });
      if (error) throw error;
      onUploaded(filename);
      setMsg(`Uploaded ${filename}`);
    } catch (e: any) {
      setMsg(e.message ?? 'Upload failed.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="rounded-md border p-3">
      <div className="text-sm font-medium mb-1">Image</div>
      {currentName ? (
        <p className="text-sm text-gray-600 mb-2">Current: {currentName}</p>
      ) : (
        <p className="text-sm text-gray-600 mb-2">No image set</p>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePick}
        disabled={busy}
      />
      {msg && <p className="mt-2 text-xs text-gray-500">{msg}</p>}
    </div>
  );
}