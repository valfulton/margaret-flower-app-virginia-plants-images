import AdminDashboard from '@/components/admin/admin-dashboard';
import SignIn from '@/components/admin/sign-in';
import { supabaseServerRSC } from '@/lib/supabaseServer';

const ADMIN_EMAIL = '1margaret.e.fisher@gmail.com';

export default async function AdminPage() {
  const sb = supabaseServerRSC();
  const { data } = await sb.auth.getUser();
  const user = data?.user ?? null;
  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  if (!user || !isAdmin) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin</h1>
        <SignIn initialEmail={ADMIN_EMAIL} />
        <p className="mt-4 text-sm text-gray-500">
          Only the master administrator may access this page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin</h1>
      <AdminDashboard />
    </main>
  );
}