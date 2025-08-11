// app/actions/flowers.ts
'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabaseServer';
import type { Flower, UpsertInput } from '@/lib/types';

export async function listFlowers(): Promise<{ data: Flower[]; error: string | null }> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('flowers')
    .select('id, latin, common, image_name, height_code')
    .order('id', { ascending: true });
  return { data: (data as Flower[]) ?? [], error: error?.message ?? null };
}

export async function getFlower(id: number): Promise<{ data: Flower | null; error: string | null }> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from('flowers').select('*').eq('id', id).maybeSingle();
  return { data: (data as Flower) ?? null, error: error?.message ?? null };
}

export async function upsertFlower(input: UpsertInput): Promise<{ data: Flower | null; error: string | null }> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('flowers')
    .upsert(input, { onConflict: 'id' })
    .select('*')
    .maybeSingle();

  if (!error) {
    revalidatePath('/admin');
    revalidatePath('/');
  }
  return { data: (data as Flower) ?? null, error: error?.message ?? null };
}

export async function deleteFlower(id: number): Promise<{ error: string | null }> {
  const supabase = await supabaseServer();
  const { error } = await supabase.from('flowers').delete().eq('id', id);
  if (!error) {
    revalidatePath('/admin');
    revalidatePath('/');
  }
  return { error: error?.message ?? null };
}