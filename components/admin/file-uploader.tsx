'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRef, useState } from 'react';

export interface FileUploaderProps {
  title: string;
  bucket: 'flowers' | 'icons';
  accept: string;               // e.g., "image/png,image/webp,image/svg+xml"
  maxBytes: number;             // size cap
  nameHint?: string;            // shown to user (naming convention)
  onUploaded?: (name: string) => void;
  // Optional image constraints (icons)
  maxWidth?: number;
  maxHeight?: number;
  mustBeSquare?: boolean;
}

function slugify(x: string) {
  return x.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

async function getImageDimensions(file: File): Promise<{w:number; h:number}> {
  const bytes = await file.arrayBuffer();
  const blob = new Blob([bytes], { type: file.type });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { w: img.naturalWidth, h: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function FileUploader({
  title,
  bucket,
  accept,
  maxBytes,
  nameHint,
  onUploaded,
  maxWidth,
  maxHeight,
  mustBeSquare,
}: FileUploaderProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(null);
    const f = e.target.files?.[0];
    if (!f) return;

    // Size check
    if (f.size > maxBytes) {
      setMsg(`File too large (${Math.round(f.size/1024)}KB). Max ${Math.round(maxBytes/1024)}KB.`);
      return;
    }

    // Optional dimension checks (for icons)
    if (f.type.startsWith('image/') && (maxWidth || maxHeight || mustBeSquare)) {
      try {
        const { w, h } = await getImageDimensions(f);
        if (maxWidth && w > maxWidth) return setMsg(`Width ${w}px exceeds ${maxWidth}px max.`);
        if (maxHeight && h > maxHeight) return setMsg(`Height ${h}px exceeds ${maxHeight}px max.`);
        if (mustBeSquare && w !== h) return setMsg(`Icon must be square. Got ${w}x${h}.`);
      } catch {
        // If decoding fails (e.g., SVG), we skip dimension checks
      }
    }

    const ext = f.name.split('.').pop()?.toLowerCase() || 'bin';
    const base = slugify(f.name.replace(/\.[^.]+$/, ''));
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const filename = `${base}_${stamp}.${ext}`;

    setBusy(true);
    try {
      const { error } = await supabase.storage.from(bucket).upload(filename, f, {
        upsert: false,
        contentType: f.type,
      });
      if (error) throw error;
      setMsg(`Uploaded: ${filename}`);
      onUploaded?.(filename);
    } catch (e: any) {
      setMsg(e.message ?? 'Upload failed.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-1 text-sm font-medium">{title}</div>
      {nameHint && <p className="mb-2 text-xs text-gray-500">{nameHint}</p>}
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={handlePick}
        disabled={busy}
        className="text-sm"
      />
      {msg && <p className="mt-2 text-xs text-gray-600">{msg}</p>}
    </div>
  );
}