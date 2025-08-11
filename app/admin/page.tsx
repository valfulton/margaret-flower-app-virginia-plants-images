import { supabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

const ALLOWED = [
  '1margaret.e.fisher@gmail.com',
  'georgerfisher@gmail.com',
].map((e) => e.toLowerCase());

export default async function AdminPage() {
  const sb = await supabaseServer();
  const { data: { session } } = await sb.auth.getSession();

  const email = (session?.user?.email ?? '').toLowerCase();
  if (!session || !ALLOWED.includes(email)) {
    redirect('/login');
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Admin</h1>
      <p className="text-sm text-gray-700">Signed in as: <strong>{session.user.email}</strong></p>
      {/* ...rest of your admin UI... */}
    </main>
  );
}