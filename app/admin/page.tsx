// app/admin/page.tsx
import { supabaseServer } from '@/lib/supabaseServer';
import type { Flower } from '@/lib/types';
import AdminDashboard from '@/components/admin/admin-dashboard';

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

  // lightweight list for the grid
  const { data: list = [] } = await supabase
    .from('flowers')
    .select('id, latin, common, image_name, height_code')
    .order('id', { ascending: true });

  // optional detail if id is present
  let selected: Flower | null = null;
  if (Number.isFinite(id)) {
    const { data } = await supabase
      .from('flowers')
      .select('*')
      .eq('id', id as number)
      .maybeSingle();
    selected = (data as Flower) ?? null;
  }

  // simple contains filter (server side)
  const filtered: Flower[] = q
    ? ((list as Flower[]).filter(
        (f) =>
          (f.common ?? '').toLowerCase().includes(q) ||
          (f.latin ?? '').toLowerCase().includes(q),
      ) as Flower[])
    : ((list as Flower[]) ?? []);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Admin (no auth)</h1>

      {/* Search box routes via ?q= */}
      <form className="mb-3">
        <input
          name="q"
          defaultValue={sp?.q ?? ''}
          placeholder="Search common/latin…"
          className="w-full rounded border px-3 py-2"
        />
      </form>

      <AdminDashboard flowers={filtered} selected={selected} />
    </main>
  );
}