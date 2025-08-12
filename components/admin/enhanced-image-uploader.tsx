// components/admin/enhanced-image-uploader.tsx
'use client';

import { useRef, useState } from 'react';
import { uploadFile } from '@/app/actions/upload';

interface Props {
  bucket: string;
  currentName: string | null;
  onUploaded: (fileName: string) => void;
  type: 'photo' | 'icon';
  title: string;
}

const MAX_BYTES = 2_000_000; // ~2MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

function slugify(x: string): string {
  return x.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Resize image to specified dimensions
function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw and resize
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to blob conversion failed'));
          }
        },
        file.type,
        0.85 // Quality for JPEG
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function EnhancedImageUploader({ bucket, currentName, onUploaded, type, title }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!ALLOWED.includes(f.type)) {
      setMsg('Only JPG, PNG, or WebP allowed.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setMsg('Please keep images under 2 MB.');
      return;
    }

    setBusy(true);
    setMsg(null);

    try {
      // Show preview
      const previewUrl = URL.createObjectURL(f);
      setPreview(previewUrl);

      const ext = f.name.split('.').pop() ?? 'jpg';
      const base = slugify(f.name.replace(/\.[^.]+$/, ''));
      const name = `${base}.${ext}`;

      let fileToUpload: File | Blob = f;

      // Resize photos but not icons
      if (type === 'photo') {
        setMsg('Resizing image...');
        fileToUpload = await resizeImage(f, 600, 600);
      }

      setMsg('Uploading...');

      // Create FormData for server action
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('bucket', bucket);
      formData.append('filename', name);

      const result = await uploadFile(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      onUploaded(name);
      setMsg('✅ Uploaded successfully!');
      
      // Clear file input
      if (fileRef.current) fileRef.current.value = '';
      
      // Clear preview after a delay
      setTimeout(() => {
        setPreview(null);
      }, 3000);

    } catch (err: unknown) {
      setMsg(`❌ ${err instanceof Error ? err.message : 'Upload failed'}`);
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileRef.current) fileRef.current.value = '';
    setMsg(null);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      
      {/* Current file info */}
      <div className="mb-3 text-sm">
        <span className="text-gray-600">Current file: </span>
        <span className="font-mono text-gray-800">
          {currentName || 'None'}
        </span>
      </div>

      {/* File input */}
      <div className="mb-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePick}
          disabled={busy}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>

      {/* Size info */}
      <div className="mb-3 text-xs text-gray-500">
        {type === 'photo' 
          ? '📐 Photos will be resized to 600×600px max' 
          : '🎯 Icons uploaded at original size'
        }
      </div>

      {/* Preview */}
      {preview && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Preview:</span>
            <button
              onClick={clearPreview}
              className="text-xs text-gray-500 hover:text-gray-700"
              disabled={busy}
            >
              Clear
            </button>
          </div>
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className={`border border-gray-300 rounded ${
                type === 'photo' ? 'max-w-[300px] max-h-[300px]' : 'max-w-[100px] max-h-[100px]'
              } object-contain`}
            />
            {type === 'photo' && (
              <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                Will be resized to fit 600×600px
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status message */}
      {msg && (
        <div className={`text-sm p-2 rounded ${
          msg.includes('✅') ? 'bg-green-100 text-green-800' : 
          msg.includes('❌') ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {msg}
        </div>
      )}

      {/* Loading indicator */}
      {busy && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}
