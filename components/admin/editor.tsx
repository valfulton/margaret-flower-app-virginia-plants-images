// components/admin/editor.tsx
'use client';

import { useState } from 'react';
import { upsertFlower, deleteFlower } from '@/app/actions/flowers';
import ImageUploader from './image-uploader';

interface Row {
  id: number;
  latin: string;
  common: string | null;
  image_name: string | null;
}

export default function AdminEditor({ flowers }: { flowers: Row[] }) {
  const [selected, setSelected] = useState<Row | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-1 rounded-xl border p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Flowers</h2>
          <button
            className="rounded-md border px-2 py-1 text-sm"
            onClick={() => setSelected({ id: 0, latin: '', common: null, image_name: null })}
          >
            + New
          </button>
        </div>
        <ul className="divide-y max-h-[70vh] overflow-y-auto">
          {flowers.map((f) => (
            <li key={f.id}>
              <button
                className="w-full text-left px-2 py-2 hover:bg-gray-50"
                onClick={() => setSelected(f)}
              >
                <div className="font-medium">{f.common ?? f.latin}</div>
                {f.common ? <div className="text-xs italic text-gray-600">{f.latin}</div> : null}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-2 rounded-xl border p-4">
        {!selected ? (
          <p className="text-sm text-gray-500">Select a flower or click “New”.</p>
        ) : (
          <form
            action={async (fd) => {
              try {
                setMessage(null);
                await upsertFlower(fd);
                setMessage('Saved.');
              } catch (e: any) {
                setMessage(e.message ?? 'Save failed.');
              }
            }}
            className="space-y-3"
          >
            <input type="hidden" name="id" value={selected.id || ''} />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <L label="Latin"><input name="latin" required defaultValue={selected.latin} className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Common"><input name="common" defaultValue={selected.common ?? ''} className="w-full rounded-md border px-3 py-2" /></L>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <L label="Height code"><input name="height_code" className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Bloom code(s)"><input name="bloom_code" className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Sun code(s)"><input name="sun_code" className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Moisture code(s)"><input name="moist_code" className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Category code(s)"><input name="cat_code" className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Deer code(s)"><input name="deer_code" className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Wildlife code(s)"><input name="wild_code" className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Soil code(s)"><input name="soil_code" className="w-full rounded-md border px-3 py-2" /></L>
            </div>

            <L label="Design function"><textarea name="design_function" className="w-full rounded-md border px-3 py-2" rows={3} /></L>
            <L label="Gardening tips"><textarea name="gardening_tips" className="w-full rounded-md border px-3 py-2" rows={3} /></L>
            <L label="Wildlife comments"><textarea name="wildlife_comments" className="w-full rounded-md border px-3 py-2" rows={3} /></L>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <L label="Credit code"><input name="credit_code" className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Region"><input name="region" className="w-full rounded-md border px-3 py-2" /></L>
              <L label="Soil pH"><input name="ph" className="w-full rounded-md border px-3 py-2" /></L>
            </div>

            <input type="hidden" name="image_name" value={selected.image_name ?? ''} />

            <ImageUploader
              currentName={selected.image_name ?? null}
              onUploaded={(name) => {
                const hidden = document.querySelector<HTMLInputElement>('input[name="image_name"]');
                if (hidden) hidden.value = name;
                setMessage(`Uploaded: ${name}`);
              }}
            />

            <div className="flex items-center gap-3">
              <button className="rounded-md border px-3 py-2 text-sm">Save</button>
              {selected.id ? (
                <button
                  type="button"
                  className="rounded-md border px-3 py-2 text-sm text-red-600"
                  onClick={async () => {
                    try {
                      await deleteFlower(selected.id);
                      location.reload();
                    } catch (e: any) {
                      setMessage(e.message ?? 'Delete failed.');
                    }
                  }}
                >
                  Delete
                </button>
              ) : null}
              {message && <span className="text-sm text-gray-600">{message}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}