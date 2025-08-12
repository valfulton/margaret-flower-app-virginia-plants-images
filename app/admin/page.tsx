// app/admin/page.tsx
import { supabaseServer } from '@/lib/supabaseServer';
import type { Flower } from '@/lib/types';
import AdminDashboard from '@/components/admin/admin-dashboard';
import Link from 'next/link';

type SP = { id?: string; q?: string };

export default async function AdminPage({
  searchParams,
}: {
  // Next 15 style: searchParams is a Promise
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const id = sp?.id ? Number(sp.id) : undefined;
  const q = (sp?.q ?? '').trim().toLowerCase();

  const supabase = await supabaseServer();

  // Enhanced list for the grid with more searchable fields
  const { data: list = [] } = await supabase
    .from('flowers')
    .select('id, latin, common, image_name, height_code, region, design_function, gardening_tips, wildlife_comments, ph')
    .order('id', { ascending: true });

  // optional detail if id is present
  let selected: Flower | null = null;
  if (Number.isFinite(id)) {
    if (id === 0) {
      // Special case: id=0 means "new flower" - create a blank object
      selected = {
        id: 0,
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
      } as Flower;
    } else {
      // Regular case: fetch existing flower
      const { data } = await supabase
        .from('flowers')
        .select('*')
        .eq('id', id as number)
        .maybeSingle();
      selected = (data as Flower) ?? null;
    }
  }

  // Enhanced search across all text fields (server side)
  const filtered: Flower[] = q
    ? ((list as Flower[]).filter(
        (f) =>
          (f.common ?? '').toLowerCase().includes(q) ||
          (f.latin ?? '').toLowerCase().includes(q) ||
          (f.region ?? '').toLowerCase().includes(q) ||
          (f.design_function ?? '').toLowerCase().includes(q) ||
          (f.gardening_tips ?? '').toLowerCase().includes(q) ||
          (f.wildlife_comments ?? '').toLowerCase().includes(q) ||
          (f.ph ?? '').toLowerCase().includes(q),
      ) as Flower[])
    : ((list as Flower[]) ?? []);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Admin (no auth)</h1>

      {/* Search box routes via ?q= */}
      <form className="mb-3">
        <div className="relative">
          <input
            name="q"
            defaultValue={sp?.q ?? ''}
            placeholder="Search by name, region, function, tips, wildlife, pH…"
            className="w-full rounded border px-3 py-2 pr-10"
          />
          {sp?.q && (
            <Link
              href="/admin"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          )}
        </div>
      </form>

      <AdminDashboard flowers={filtered} selected={selected} />
    </main>
  );
}