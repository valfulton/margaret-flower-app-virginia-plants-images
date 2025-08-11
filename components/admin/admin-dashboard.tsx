// components/admin/admin-dashboard.tsx
import { supabaseServer } from '@/lib/supabaseServer';
import AdminEditor from './editor';

export default async function AdminDashboard() {
  const sb = await supabaseServer();
  const { data: flowers } = await sb
    .from('flowers')
    .select('id, latin, common, image_name')
    .order('latin');

  return <AdminEditor flowers={flowers ?? []} />;
}