// components/admin/image-uploader.tsx
'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  bucket: string;
  currentName: string | null;
  prefix?: string;
  onUploaded: (fileName: string) => void;
}

const MAX_BYTES = 1_500_000; // ~1.5MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

function slugify(x: string): string {
  return x.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export default function ImageUploader({ bucket, currentName, onUploaded, prefix = '' }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!ALLOWED.includes(f.type)) return setMsg('Only JPG, PNG, or WebP allowed.');
    if (f.size > MAX_BYTES) return setMsg('Please keep images under 1.5 MB.');

    setBusy(true);
    setMsg(null);
    try {
      const ext = f.name.split('.').pop() ?? 'jpg';
      const base = slugify(f.name.replace(/\.[^.]+$/, ''));
      const name = prefix ? `${prefix}_${base}.${ext}` : `${base}.${ext}`;
      const path = name;

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, f, {
        upsert: true,
        cacheControl: '3600',
        contentType: f.type,
      });
      if (upErr) throw upErr;

      onUploaded(name);
      setMsg('Uploaded ✓');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      setMsg(err?.message ?? 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        Current: <span className="font-mono">{currentName ?? '—'}</span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handlePick}
        disabled={busy}
        className="block w-full text-sm"
      />
      {msg && <div className="text-xs text-gray-600">{msg}</div>}
    </div>
  );
}