import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await supabaseServer();

    // Fetch all lookup tables in parallel
    const [
      categoriesRes,
      heightRes,
      bloomRes,
      moistureRes,
      sunRes,
      wildlifeRes,
      soilRes,
      deerRes,
    ] = await Promise.all([
      supabase.from('categories').select('cat_code, cat_display').order('cat_display'),
      supabase.from('height').select('height_code, height_display').order('height_code'),
      supabase.from('bloom').select('bloom_code, bloom_display').order('bloom_display'),
      supabase.from('moisture').select('moist_code, moist_display').order('moist_display'),
      supabase.from('sun').select('sun_code, sun_display').order('sun_display'),
      supabase.from('wildlife').select('wild_code, wildlife_display').order('wildlife_display'),
      supabase.from('soil').select('soil_code, soil_display').order('soil_display'),
      supabase.from('deer').select('deer_code, deer_display').order('deer_display'),
    ]);

    // Check for errors
    const errors = [
      categoriesRes.error,
      heightRes.error,
      bloomRes.error,
      moistureRes.error,
      sunRes.error,
      wildlifeRes.error,
      soilRes.error,
      deerRes.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('Lookup options fetch errors:', errors);
      return NextResponse.json({ error: 'Failed to fetch lookup options' }, { status: 500 });
    }

    return NextResponse.json({
      categories: (categoriesRes.data || []).map(item => ({ code: item.cat_code, display: item.cat_display })),
      height: (heightRes.data || []).map(item => ({ code: item.height_code, display: item.height_display })),
      bloom: (bloomRes.data || []).map(item => ({ code: item.bloom_code, display: item.bloom_display })),
      moisture: (moistureRes.data || []).map(item => ({ code: item.moist_code, display: item.moist_display })),
      sun: (sunRes.data || []).map(item => ({ code: item.sun_code, display: item.sun_display })),
      wildlife: (wildlifeRes.data || []).map(item => ({ code: item.wild_code, display: item.wildlife_display })),
      soil: (soilRes.data || []).map(item => ({ code: item.soil_code, display: item.soil_display })),
      deer: (deerRes.data || []).map(item => ({ code: item.deer_code, display: item.deer_display })),
    });

  } catch (error) {
    console.error('Lookup options API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
