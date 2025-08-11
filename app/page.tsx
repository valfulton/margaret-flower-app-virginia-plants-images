import { supabaseServer } from '@/lib/supabaseServer';
import type { FlowerRow } from '@/lib/types';
import { FlowerCard } from '@/components/flowers/flower-card';

interface PageProps {
  searchParams?: Promise<{ q?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = (resolvedSearchParams?.q ?? '').trim();
  const supabase = await supabaseServer();

  let query = supabase
    .from('flowers')
    .select('id, latin, common, image_name, height_code')
    .order('latin', { ascending: true });

  if (q) {
    query = query.or(`latin.ilike.%${q}%,common.ilike.%${q}%`);
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
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Search flowers…"
        aria-label="Search flowers"
        className="w-full max-w-xl rounded-xl border px-4 py-2 outline-none focus:ring"
      />
    </form>
  );
}