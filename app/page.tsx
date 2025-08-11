import { supabaseServer } from '@/lib/supabaseServer';
import type { FlowerRow } from '@/lib/types';
import { FlowerCard } from '@/components/flowers/flower-card';
import Link from 'next/link';

interface PageProps {
  searchParams?: Promise<{ q?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = (resolvedSearchParams?.q ?? '').trim();
  const supabase = await supabaseServer();

  let query = supabase
    .from('flowers')
    .select('id, latin, common, image_name, height_code, region, design_function, gardening_tips, wildlife_comments, ph')
    .order('latin', { ascending: true });

  if (q) {
    // Enhanced search across all text fields
    query = query.or(`latin.ilike.%${q}%,common.ilike.%${q}%,region.ilike.%${q}%,design_function.ilike.%${q}%,gardening_tips.ilike.%${q}%,wildlife_comments.ilike.%${q}%,ph.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('flowers query error:', error);
    return (
      <main className="mx-auto max-w-6xl p-6">
        <Header />
        <SearchBar defaultValue={q} />
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          Failed to load flowers.
        </p>
      </main>
    );
  }

  const flowers = (data ?? []) as FlowerRow[];
  const imagesBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/flowers`;
  const iconsBase  = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons`;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <Header />
      <SearchBar defaultValue={q} />

      {flowers.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No flowers found.</p>
      ) : (
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {flowers.map((f) => (
            <FlowerCard key={f.id} flower={f} imagesBase={imagesBase} iconsBase={iconsBase} />
          ))}
        </div>
      )}
    </main>
  );
}

function Header() {
  return <h1 className="mb-4 text-2xl font-bold">NOVA Native Plants</h1>;
}

function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form action="/" className="w-full">
      <div className="relative max-w-xl">
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Search plants by name, region, function, growing tips, wildlife info, pH…"
          aria-label="Search flowers"
          className="w-full rounded-xl border px-4 py-2 pr-10 outline-none focus:ring"
        />
        {defaultValue && (
          <Link
            href="/"
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
  );
}