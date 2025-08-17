'use server';

import { supabaseServer } from '@/lib/supabaseServer';
import type { Flower } from '@/lib/types';

export async function searchFlowers(searchTerm: string): Promise<{ data: Flower[]; error: string | null }> {
  const supabase = await supabaseServer();
  
  if (!searchTerm.trim()) {
    // Return all flowers if no search term
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .order('latin', { ascending: true });
    
    return { data: (data as Flower[]) ?? [], error: error?.message ?? null };
  }

  try {
    // Enhanced search across all text fields
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .or(`latin.ilike.%${searchTerm}%,common.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%,design_function.ilike.%${searchTerm}%,gardening_tips.ilike.%${searchTerm}%,wildlife_comments.ilike.%${searchTerm}%,ph.ilike.%${searchTerm}%`)
      .order('latin', { ascending: true });

    if (error) {
      console.error('Search error:', error);
      return { data: [], error: error.message };
    }

    return { data: (data as Flower[]) ?? [], error: null };

  } catch (error) {
    console.error('Search error:', error);
    return { data: [], error: 'Search failed' };
  }
}
