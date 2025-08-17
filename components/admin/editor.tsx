// components/admin/editor.tsx
'use client';

import { useMemo, useState } from 'react';
import { upsertFlower, deleteFlower } from '@/app/actions/flowers';
import type { Flower, UpsertInput } from '@/lib/types';

type Props = {
  initial: Flower | null;
  onSaved?: (saved: Flower) => void;
  onDeleted?: (id: number) => void;
};

/** simple field helpers that accept string|number values */
function Text(props: { label: string; value: string | null; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      {props.label}
      <input
        className="mt-1 w-full rounded border px-3 py-2"
        value={props.value ?? ''}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}
function Num(props: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <label className="block text-sm">
      {props.label}
      <input
        type="number"
        className="mt-1 w-full rounded border px-3 py-2"
        value={props.value ?? ''}
        onChange={(e) => {
          const v = e.target.value.trim();
          props.onChange(v === '' ? null : Number(v));
        }}
      />
    </label>
  );
}
function TextArea(props: { label: string; value: string | null; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      {props.label}
      <textarea
        className="mt-1 w-full rounded border px-3 py-2"
        rows={3}
        value={props.value ?? ''}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

export default function Editor({ initial, onSaved, onDeleted }: Props) {
  const blank: UpsertInput = useMemo(
    () => ({
      id: undefined,
      common: '',
      latin: '',
      image_name: null,
      height_code: null,
      bloom_code: null,
      sun_code: null,
      moist_code: null,
      cat_code: null,
      deer_code: null,
      wild_code: null,
      soil_code: null,
      region: '',
      design_function: '',
      gardening_tips: '',
      wildlife_comments: '',
      credit_code: null,
      ph: '',
    }),
    [],
  );

  const [form, setForm] = useState<UpsertInput>(initial ?? blank);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof UpsertInput>(key: K, val: UpsertInput[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function onSave() {
    if (busy) return;
    setBusy(true);
    setMsg(null);

    const input: UpsertInput = { ...form, id: form.id ?? initial?.id ?? undefined };

    const { data, error } = await upsertFlower(input);
    setBusy(false);

    if (error || !data) {
      setMsg(error ?? 'Save failed');
      return;
    }
    setMsg('Saved ✓');
    onSaved?.(data);
  }

  async function onDelete() {
    if (!initial?.id || busy) return;
    if (!confirm('Delete this flower?')) return;
    setBusy(true);
    const { error } = await deleteFlower(initial.id);
    setBusy(false);
    if (error) {
      setMsg(error);
      return;
    }
    onDeleted?.(initial.id);
  }

  return (
    <div className="w-[min(92vw,900px)]">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Text label="Common name" value={form.common} onChange={(v) => set('common', v)} />
        <Text label="Latin name" value={form.latin} onChange={(v) => set('latin', v)} />
        <Text label="Image filename (in flowers bucket)" value={form.image_name ?? ''} onChange={(v) => set('image_name', v)} />

        <Num label="Height code" value={form.height_code} onChange={(v) => set('height_code', v)} />
        <Num label="Bloom code" value={form.bloom_code} onChange={(v) => set('bloom_code', v)} />
        <Num label="Sun code" value={form.sun_code} onChange={(v) => set('sun_code', v)} />
        <Num label="Moisture code" value={form.moist_code} onChange={(v) => set('moist_code', v)} />

        <Num label="Category code" value={form.cat_code} onChange={(v) => set('cat_code', v)} />
        <Num label="Deer code" value={form.deer_code} onChange={(v) => set('deer_code', v)} />
        <Num label="Wildlife code" value={form.wild_code} onChange={(v) => set('wild_code', v)} />
        <Num label="Soil code" value={form.soil_code} onChange={(v) => set('soil_code', v)} />

        <Text label="Region" value={form.region ?? ''} onChange={(v) => set('region', v)} />
        <Text label="pH" value={form.ph ?? ''} onChange={(v) => set('ph', v)} />

        <TextArea label="Design function" value={form.design_function ?? ''} onChange={(v) => set('design_function', v)} />
        <TextArea label="Gardening tips" value={form.gardening_tips ?? ''} onChange={(v) => set('gardening_tips', v)} />
        <TextArea label="Wildlife comments" value={form.wildlife_comments ?? ''} onChange={(v) => set('wildlife_comments', v)} />
        <Num label="Credit code" value={form.credit_code} onChange={(v) => set('credit_code', v)} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={onSave}
          disabled={busy}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>

        {initial?.id ? (
          <button
            type="button"
            className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            onClick={onDelete}
            disabled={busy}
          >
            Delete
          </button>
        ) : null}

        {msg && <span className="text-sm text-gray-700">{msg}</span>}
      </div>
    </div>
  );
}