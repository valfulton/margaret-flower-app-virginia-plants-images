// components/admin/enhanced-editor.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { upsertFlower, deleteFlower } from '@/app/actions/flowers';
import type { Flower, UpsertInput } from '@/lib/types';

interface LookupOption {
  code: number;
  display: string;
}

interface LookupData {
  categories: LookupOption[];
  height: LookupOption[];
  bloom: LookupOption[];
  moisture: LookupOption[];
  sun: LookupOption[];
  wildlife: LookupOption[];
  soil: LookupOption[];
  deer: LookupOption[];
}

type Props = {
  initial: Flower | null;
  onSaved?: (saved: Flower) => void;
  onDeleted?: (id: number) => void;
};

/** Enhanced field helpers with better UX */
function Text(props: { label: string; value: string | null; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{props.label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        value={props.value ?? ''}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

function Select(props: { 
  label: string; 
  value: number | null; 
  onChange: (v: number | null) => void; 
  options: LookupOption[];
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{props.label}</span>
      <select
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        value={props.value ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          props.onChange(v === '' ? null : Number(v));
        }}
      >
        <option value="">{props.placeholder || &apos;Select...&apos;}</option>
        {props.options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.display}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea(props: { label: string; value: string | null; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{props.label}</span>
      <textarea
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        rows={3}
        value={props.value ?? ''}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

function NumericInput(props: { label: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{props.label}</span>
      <input
        type="number"
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        value={props.value ?? ''}
        placeholder={props.placeholder}
        onChange={(e) => {
          const v = e.target.value.trim();
          props.onChange(v === '' ? null : Number(v));
        }}
      />
    </label>
  );
}

export default function EnhancedEditor({ initial, onSaved, onDeleted }: Props) {
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [loadingLookups, setLoadingLookups] = useState(true);

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

  // Load lookup data on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const response = await fetch('/api/lookup-options');
        if (response.ok) {
          const data = await response.json();
          setLookupData(data);
        } else {
          console.error('Failed to load lookup options');
        }
      } catch (error) {
        console.error('Error loading lookup options:', error);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, []);

  function set<K extends keyof UpsertInput>(key: K, val: UpsertInput[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    // Clear any previous messages when user starts editing
    if (msg) setMsg(null);
  }

  async function onSave() {
    if (busy) return;
    
    // Validate required fields
    if (!form.common.trim()) {
      setMsg('Common name is required');
      return;
    }
    if (!form.latin.trim()) {
      setMsg('Latin name is required');
      return;
    }

    setBusy(true);
    setMsg(null);

    const input: UpsertInput = { 
      ...form, 
      id: form.id && form.id !== 0 ? form.id : initial?.id && initial.id !== 0 ? initial.id : undefined 
    };

    const { data, error } = await upsertFlower(input);
    setBusy(false);

    if (error || !data) {
      setMsg(error ?? 'Save failed');
      return;
    }
    setMsg('✅ Successfully saved!');
    setTimeout(() => {
      onSaved?.(data);
    }, 1000); // Show success message briefly before closing
  }

  async function onDelete() {
    if (!initial?.id || initial.id === 0 || busy) return;
    if (!confirm('Are you sure you want to delete this flower? This action cannot be undone.')) return;
    setBusy(true);
    setMsg(null);
    const { error } = await deleteFlower(initial.id);
    setBusy(false);
    if (error) {
      setMsg('❌ Delete failed: ' + error);
      return;
    }
    setMsg('✅ Successfully deleted!');
    setTimeout(() => {
      onDeleted?.(initial.id);
    }, 1000);
  }

  if (loadingLookups) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading form options...</div>
      </div>
    );
  }

  if (!lookupData) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <p className="text-red-700">Failed to load form options. Please refresh and try again.</p>
      </div>
    );
  }

  return (
    <div className="w-[min(95vw,1000px)] max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Text 
              label="Common Name *" 
              value={form.common} 
              onChange={(v) => set('common', v)}
              placeholder="e.g., Black-eyed Susan"
            />
            <Text 
              label="Latin Name *" 
              value={form.latin} 
              onChange={(v) => set('latin', v)}
              placeholder="e.g., Rudbeckia hirta"
            />
            <Text 
              label="Image Filename" 
              value={form.image_name ?? ''} 
              onChange={(v) => set('image_name', v)}
              placeholder="e.g., rudbeckia_hirta.jpg"
            />
            <Text 
              label="Region" 
              value={form.region ?? ''} 
              onChange={(v) => set('region', v)}
              placeholder="e.g., Coastal, Mountain, Piedmont"
            />
          </div>
        </div>

        {/* Plant Characteristics */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Plant Characteristics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select 
              label="Category" 
              value={form.cat_code} 
              onChange={(v) => set('cat_code', v)}
              options={lookupData.categories}
              placeholder="Select plant type"
            />
            <Select 
              label="Height" 
              value={form.height_code} 
              onChange={(v) => set('height_code', v)}
              options={lookupData.height}
              placeholder="Select height range"
            />
            <Select 
              label="Bloom Time" 
              value={form.bloom_code} 
              onChange={(v) => set('bloom_code', v)}
              options={lookupData.bloom}
              placeholder="Select bloom season"
            />
          </div>
        </div>

        {/* Growing Conditions */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Growing Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select 
              label="Sun Requirements" 
              value={form.sun_code} 
              onChange={(v) => set('sun_code', v)}
              options={lookupData.sun}
              placeholder="Select sun needs"
            />
            <Select 
              label="Moisture Needs" 
              value={form.moist_code} 
              onChange={(v) => set('moist_code', v)}
              options={lookupData.moisture}
              placeholder="Select moisture needs"
            />
            <Select 
              label="Soil Type" 
              value={form.soil_code} 
              onChange={(v) => set('soil_code', v)}
              options={lookupData.soil}
              placeholder="Select soil preference"
            />
            <Text 
              label="pH Range" 
              value={form.ph ?? ''} 
              onChange={(v) => set('ph', v)}
              placeholder="e.g., 6.0-7.5"
            />
          </div>
        </div>

        {/* Wildlife & Garden Use */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Wildlife & Garden Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Wildlife Value" 
              value={form.wild_code} 
              onChange={(v) => set('wild_code', v)}
              options={lookupData.wildlife}
              placeholder="Select wildlife benefits"
            />
            <Select 
              label="Deer Resistance" 
              value={form.deer_code} 
              onChange={(v) => set('deer_code', v)}
              options={lookupData.deer}
              placeholder="Select deer resistance"
            />
          </div>
        </div>

        {/* Detailed Information */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Information</h3>
          <div className="space-y-4">
            <TextArea 
              label="Design Function" 
              value={form.design_function ?? ''} 
              onChange={(v) => set('design_function', v)}
              placeholder="How this plant is used in landscape design..."
            />
            <TextArea 
              label="Gardening Tips" 
              value={form.gardening_tips ?? ''} 
              onChange={(v) => set('gardening_tips', v)}
              placeholder="Growing tips, care instructions, special notes..."
            />
            <TextArea 
              label="Wildlife Comments" 
              value={form.wildlife_comments ?? ''} 
              onChange={(v) => set('wildlife_comments', v)}
              placeholder="Specific wildlife benefits, host plant information..."
            />
            <NumericInput 
              label="Credit Code" 
              value={form.credit_code} 
              onChange={(v) => set('credit_code', v)}
              placeholder="Photo/info source reference"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={onSave}
          disabled={busy}
        >
          {busy ? '⏳ Saving...' : '💾 Save Flower'}
        </button>

        {initial?.id && initial.id !== 0 && (
          <button
            type="button"
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={onDelete}
            disabled={busy}
          >
            {busy ? '⏳ Deleting...' : '🗑️ Delete'}
          </button>
        )}

        {msg && (
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            msg.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {msg}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Fields marked with * are required. All dropdown options are loaded from your database lookup tables.
        </p>
      </div>
    </div>
  );
}
