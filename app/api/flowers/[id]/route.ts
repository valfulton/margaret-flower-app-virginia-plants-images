import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

/** split "1;2, 3  4" -> ["1","2","3","4"] */
function splitCodes(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[;, ]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const params = await ctx.params;
  const idNum = Number(params.id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const supabase = await supabaseServer();

  // 1) Base flower row (pull everything so we don’t miss fields)
  const { data: flower, error: flowerErr } = await supabase
    .from('flowers')
    .select('*')
    .eq('id', idNum)
    .single();

  if (flowerErr || !flower) {
    console.error('flower fetch error', flowerErr);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 2) Build lookups. Each may be a single code or delimited list — handle both.
  const lookups: Record<string, unknown> = {};

  // helper to fetch *one* row by exact code
  const fetchOne = async (table: string, codeField: string, code?: string | null) => {
    if (!code) return null;
    const { data } = await supabase.from(table).select('*').eq(codeField, code).maybeSingle();
    return data ?? null;
  };

  // helper to fetch *many* rows by codes
  const fetchMany = async (table: string, codeField: string, raw?: string | null) => {
    const codes = splitCodes(raw);
    if (!codes.length) return [];
    const { data } = await supabase.from(table).select('*').in(codeField, codes);
    return data ?? [];
  };

  // single-or-many lookups (adjusted to your schema names)
  lookups.height   = await fetchOne('height',   'height_code', flower.height_code);
  lookups.bloom    = await fetchMany('bloom',   'bloom_code',  flower.bloom_code);
  lookups.sun      = await fetchMany('sun',     'sun_code',    flower.sun_code);
  lookups.moisture = await fetchMany('moisture','moist_code',  flower.moist_code);
  lookups.category = await fetchMany('categories','cat_code',  flower.cat_code);
  lookups.deer     = await fetchMany('deer',    'deer_code',   flower.deer_code);
  lookups.wildlife = await fetchMany('wildlife','wild_code',   flower.wild_code);
  lookups.soil     = await fetchMany('soil',    'soil_code',   flower.soil_code);
  lookups.credit   = await fetchOne('photo_credits', 'credit_code', flower.credit_code);

  return NextResponse.json({ ...flower, lookups });
}