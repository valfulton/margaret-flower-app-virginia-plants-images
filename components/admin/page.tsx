// components/admin/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Flower } from '@/lib/types';
import Editor from './editor';

export default function AdminClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const idParam = sp.get('id');
  const qParam = sp.get('q') ?? '';
  const id = useMemo(() => (idParam ? Number(idParam) : NaN), [idParam]);
  const q = useMemo(() => qParam.trim().toLowerCase(), [qParam]);

  const [list, setList] = useState<Flower[]>([]);
  const [selected, setSelected] = useState<Flower | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load list
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingList(true);
      setError(null);
      const { data, error } = await supabase
        .from('flowers')
        .select('id, latin, common, image_name, height_code')
        .order('id', { ascending: true });
      if (!alive) return;
      if (error) setError(error.message);
      setList((data as Flower[]) ?? []);
      setLoadingList(false);
    })();
    return () => { alive = false; };
  }, []);

  // Load detail on id change
  useEffect(() => {
    let alive = true;
    if (!Number.isFinite(id)) {
      setSelected(null);
      return;
    }
    (async () => {
      setLoadingDetail(true);
      const { data, error } = await supabase
        .from('flowers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!alive) return;
      if (error) {
        setError(error.message);
        setSelected(null);
      } else {
        setSelected((data as Flower) ?? null);
      }
      setLoadingDetail(false);
    })();
    return () => { alive = false; };
  }, [id]);

  // Client-side filter
  const filtered = useMemo(() => {
    if (!q) return list;
    return list.filter(
      (f) =>
        (f.common ?? '').toLowerCase().includes(q) ||
        (f.latin ?? '').toLowerCase().includes(q),
    );
  }, [list, q]);

  // URL helpers
  const pushQuery = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    router.push(`/admin?${params.toString()}`);
  };

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    pushQuery({ q: String(fd.get('q') ?? '') || undefined, id: idParam || undefined });
  };

  const onNew = () => pushQuery({ id: undefined });
  const onPick = (fid: number) => pushQuery({ id: String(fid), q: qParam || undefined });

  // After save/delete, update list + selection locally
  const refreshAfterSave = (saved: Flower) => {
    setList((prev) => {
      const i = prev.findIndex((p) => p.id === saved.id);
      if (i === -1) return [saved, ...prev].sort((a, b) => a.id - b.id);
      const next = [...prev];
      next[i] = saved;
      return next;
    });
    setSelected(saved);
    pushQuery({ id: String(saved.id), q: qParam || undefined });
  };

  const removeFromList = (id: number) => {
    setList((prev) => prev.filter((p) => p.id !== id));
    setSelected(null);
    pushQuery({ id: undefined, q: qParam || undefined });
  };

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Admin (no auth)</h1>
      {error && <p className="mb-4 text-red-600">Error: {error}</p>}

      <div className="grid gap-6 md:grid-cols-[1fr,minmax(360px,500px)]">
        {/* LEFT: scrollable list */}
        <section>
          <form className="mb-3" onSubmit={onSearch}>
            <input
              name="q"
              defaultValue={qParam}
              placeholder="Search common name…"
              className="w-full rounded border px-3 py-2"
            />
          </form>

          <button
            type="button"
            onClick={onNew}
            className={`mb-2 block w-full rounded px-2 py-1 text-left ${
              !Number.isFinite(id) ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            + New Flower
          </button>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(filtered ?? []).map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => onPick(f.id)}
                  className={`block w-full rounded border p-2 text-left hover:bg-gray-50 ${
                    selected?.id === f.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="font-medium">{f.common}</div>
                  <div className="text-xs italic text-gray-600">{f.latin}</div>
                </button>
              </li>
            ))}
          </ul>

          {(loadingList || loadingDetail) && (
            <p className="mt-3 text-sm text-gray-500">Loading…</p>
          )}
        </section>

        {/* RIGHT: sticky editor */}
        <aside className="md:sticky md:top-6 h-fit rounded border p-4 bg-white">
          <Editor
            key={selected?.id ?? 'new'} // reset form when switching
            initial={selected ?? null}
            onSaved={refreshAfterSave}
            onDeleted={removeFromList}
          />
        </aside>
      </div>
    </main>
  );
}