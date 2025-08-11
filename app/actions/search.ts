'use server';

import { supabaseServer } from '@/lib/supabaseServer';
import type { Flower } from '@/lib/types';

export async function searchFlowers(searchTerm: string): Promise<{ data: Flower[]; error: string | null }> {
  if (!searchTerm.trim()) {
    // Return all flowers if no search term
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .order('latin', { ascending: true });
    
    return { data: (data as Flower[]) ?? [], error: error?.message ?? null };
  }

  const supabase = await supabaseServer();
  const term = searchTerm.trim().toLowerCase();

  try {
    // 1. First get flowers that match text fields directly
    const { data: directMatches, error: directError } = await supabase
      .from('flowers')
      .select('*')
      .or(`latin.ilike.%${term}%,common.ilike.%${term}%,region.ilike.%${term}%,design_function.ilike.%${term}%,gardening_tips.ilike.%${term}%,wildlife_comments.ilike.%${term}%,ph.ilike.%${term}%`)
      .order('latin', { ascending: true });

    if (directError) {
      console.error('Direct search error:', directError);
      return { data: [], error: directError.message };
    }

    // 2. Search in lookup tables for descriptions that match
    const lookupMatches = new Set<number>();

    // Search height table
    const { data: heightMatches } = await supabase
      .from('height')
      .select('height_code, height_display')
      .ilike('height_display', `%${term}%`);
    
    if (heightMatches?.length) {
      const codes = heightMatches.map(h => h.height_code);
      const { data: flowers } = await supabase
        .from('flowers')
        .select('*')
        .in('height_code', codes);
      flowers?.forEach(f => lookupMatches.add(f.id));
    }

    // Search bloom table
    const { data: bloomMatches } = await supabase
      .from('bloom')
      .select('bloom_code, bloom_display')
      .ilike('bloom_display', `%${term}%`);
    
    if (bloomMatches?.length) {
      const codes = bloomMatches.map(b => b.bloom_code);
      // Handle comma-separated bloom codes
      const { data: flowers } = await supabase
        .from('flowers')
        .select('*')
        .not('bloom_code', 'is', null);
      
      flowers?.forEach(f => {
        if (f.bloom_code) {
          const flowerCodes = f.bloom_code.toString().split(/[;, ]+/).map(c => c.trim());
          if (flowerCodes.some(code => codes.includes(code))) {
            lookupMatches.add(f.id);
          }
        }
      });
    }

    // Search sun table
    const { data: sunMatches } = await supabase
      .from('sun')
      .select('sun_code, sun_display')
      .ilike('sun_display', `%${term}%`);
    
    if (sunMatches?.length) {
      const codes = sunMatches.map(s => s.sun_code);
      const { data: flowers } = await supabase
        .from('flowers')
        .select('*')
        .not('sun_code', 'is', null);
      
      flowers?.forEach(f => {
        if (f.sun_code) {
          const flowerCodes = f.sun_code.toString().split(/[;, ]+/).map(c => c.trim());
          if (flowerCodes.some(code => codes.includes(code))) {
            lookupMatches.add(f.id);
          }
        }
      });
    }

    // Search moisture table
    const { data: moistureMatches } = await supabase
      .from('moisture')
      .select('moist_code, moist_display')
      .ilike('moist_display', `%${term}%`);
    
    if (moistureMatches?.length) {
      const codes = moistureMatches.map(m => m.moist_code);
      const { data: flowers } = await supabase
        .from('flowers')
        .select('*')
        .not('moist_code', 'is', null);
      
      flowers?.forEach(f => {
        if (f.moist_code) {
          const flowerCodes = f.moist_code.toString().split(/[;, ]+/).map(c => c.trim());
          if (flowerCodes.some(code => codes.includes(code))) {
            lookupMatches.add(f.id);
          }
        }
      });
    }

    // Search categories table
    const { data: categoryMatches } = await supabase
      .from('categories')
      .select('cat_code, cat_display')
      .ilike('cat_display', `%${term}%`);
    
    if (categoryMatches?.length) {
      const codes = categoryMatches.map(c => c.cat_code);
      const { data: flowers } = await supabase
        .from('flowers')
        .select('*')
        .not('cat_code', 'is', null);
      
      flowers?.forEach(f => {
        if (f.cat_code) {
          const flowerCodes = f.cat_code.toString().split(/[;, ]+/).map(c => c.trim());
          if (flowerCodes.some(code => codes.includes(code))) {
            lookupMatches.add(f.id);
          }
        }
      });
    }

    // 3. Get flowers that matched via lookup tables
    let lookupFlowers: Flower[] = [];
    if (lookupMatches.size > 0) {
      const { data: lookup, error: lookupError } = await supabase
        .from('flowers')
        .select('*')
        .in('id', Array.from(lookupMatches))
        .order('latin', { ascending: true });
      
      if (lookupError) {
        console.error('Lookup search error:', lookupError);
      } else {
        lookupFlowers = lookup as Flower[] ?? [];
      }
    }

    // 4. Combine and deduplicate results
    const allResults = new Map<number, Flower>();
    
    // Add direct matches
    (directMatches as Flower[] ?? []).forEach(flower => {
      allResults.set(flower.id, flower);
    });
    
    // Add lookup matches
    lookupFlowers.forEach(flower => {
      allResults.set(flower.id, flower);
    });

    // Sort by latin name
    const finalResults = Array.from(allResults.values())
      .sort((a, b) => a.latin.localeCompare(b.latin));

    return { data: finalResults, error: null };

  } catch (error) {
    console.error('Search error:', error);
    return { data: [], error: 'Search failed' };
  }
}
