import { supabaseServer } from '@/lib/supabaseServer';
import type { FlowerRow } from '@/lib/types';
import { FlowerCard } from '@/components/flowers/flower-card';
import { MainPageWithSearch } from '@/components/search/main-page-with-search';

interface PageProps {
  searchParams?: Promise<{ 
    q?: string;
    cat_code?: string;
    height_code?: string;
    bloom_code?: string;
    moist_code?: string;
    sun_code?: string;
    wild_code?: string;
    soil_code?: string;
    deer_code?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = (resolvedSearchParams?.q ?? '').trim();
  
  // Extract filter parameters
  const filters = {
    cat_code: parseInt(resolvedSearchParams?.cat_code || '0'),
    height_code: parseInt(resolvedSearchParams?.height_code || '0'),
    bloom_code: parseInt(resolvedSearchParams?.bloom_code || '0'),
    moist_code: parseInt(resolvedSearchParams?.moist_code || '0'),
    sun_code: parseInt(resolvedSearchParams?.sun_code || '0'),
    wild_code: parseInt(resolvedSearchParams?.wild_code || '0'),
    soil_code: parseInt(resolvedSearchParams?.soil_code || '0'),
    deer_code: parseInt(resolvedSearchParams?.deer_code || '0'),
  };

  const supabase = await supabaseServer();

  let query = supabase
    .from('flowers')
    .select('*')
    .order('latin', { ascending: true });

  // Apply text search
  if (q) {
    query = query.or(`latin.ilike.%${q}%,common.ilike.%${q}%,region.ilike.%${q}%,design_function.ilike.%${q}%,gardening_tips.ilike.%${q}%,wildlife_comments.ilike.%${q}%,ph.ilike.%${q}%`);
  }

  // Apply filter constraints
  Object.entries(filters).forEach(([key, value]) => {
    if (value > 0) {
      query = query.eq(key, value);
    }
  });

  const { data: flowersData, error } = await query;

  if (error) {
    console.error('flowers query error:', error);
    return (
      <MainPageWithSearch searchQuery={q}>
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          Failed to load flowers.
        </p>
      </MainPageWithSearch>
    );
  }

  // Fetch lookup data for display names
  const [heightLookups, categoryLookups] = await Promise.all([
    supabase.from('height').select('height_code, height_display'),
    supabase.from('categories').select('cat_code, cat_display'),
  ]);

  // Create lookup maps
  const heightMap = new Map(
    (heightLookups.data || []).map(h => [h.height_code, h.height_display])
  );
  const categoryMap = new Map(
    (categoryLookups.data || []).map(c => [c.cat_code, c.cat_display])
  );

  // Augment flowers with lookup data
  const flowers: FlowerRow[] = (flowersData || []).map(flower => ({
    ...flower,
    height: flower.height_code ? [{ height_display: heightMap.get(flower.height_code) || '' }] : null,
    categories: flower.cat_code ? [{ cat_display: categoryMap.get(flower.cat_code) || '' }] : null,
  }));

  // Use the augmented flowers data
  const imagesBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/flowers`;
  const iconsBase  = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons`;

  return (
    <MainPageWithSearch searchQuery={q}>
      {flowers.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No flowers found.</p>
      ) : (
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {flowers.map((f) => (
            <FlowerCard key={f.id} flower={f} imagesBase={imagesBase} iconsBase={iconsBase} />
          ))}
        </div>
      )}
    </MainPageWithSearch>
  );
}