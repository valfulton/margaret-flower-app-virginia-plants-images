// app/actions/flowers.ts
'use server';

import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const flowerSchema = z.object({
  id: z.number().optional(),
  latin: z.string().min(1),
  common: z.string().optional().nullable(),
  image_name: z.string().optional().nullable(),
  height_code: z.string().optional().nullable(),
  bloom_code: z.string().optional().nullable(),
  sun_code: z.string().optional().nullable(),
  moist_code: z.string().optional().nullable(),
  cat_code: z.string().optional().nullable(),
  deer_code: z.string().optional().nullable(),
  wild_code: z.string().optional().nullable(),
  soil_code: z.string().optional().nullable(),
  wildlife_comments: z.string().optional().nullable(),
  design_function: z.string().optional().nullable(),
  gardening_tips: z.string().optional().nullable(),
  credit_code: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  ph: z.string().optional().nullable(),
});

export async function upsertFlower(formData: FormData) {
  const s = await supabaseServer(); // carries session via cookies
  const raw = Object.fromEntries(formData.entries());

  const data = flowerSchema.parse({
    id: raw.id ? Number(raw.id) : undefined,
    latin: String(raw.latin ?? ''),
    common: raw.common ? String(raw.common) : null,
    image_name: raw.image_name ? String(raw.image_name) : null,
    height_code: raw.height_code ? String(raw.height_code) : null,
    bloom_code: raw.bloom_code ? String(raw.bloom_code) : null,
    sun_code: raw.sun_code ? String(raw.sun_code) : null,
    moist_code: raw.moist_code ? String(raw.moist_code) : null,
    cat_code: raw.cat_code ? String(raw.cat_code) : null,
    deer_code: raw.deer_code ? String(raw.deer_code) : null,
    wild_code: raw.wild_code ? String(raw.wild_code) : null,
    soil_code: raw.soil_code ? String(raw.soil_code) : null,
    wildlife_comments: raw.wildlife_comments ? String(raw.wildlife_comments) : null,
    design_function: raw.design_function ? String(raw.design_function) : null,
    gardening_tips: raw.gardening_tips ? String(raw.gardening_tips) : null,
    credit_code: raw.credit_code ? String(raw.credit_code) : null,
    region: raw.region ? String(raw.region) : null,
    ph: raw.ph ? String(raw.ph) : null,
  });

  if (data.id) {
    const { error } = await s.from('flowers').update(data).eq('id', data.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await s.from('flowers').insert(data);
    if (error) throw new Error(error.message);
  }
}

export async function deleteFlower(id: number) {
  const s = await supabaseServer();
  const { error } = await s.from('flowers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}