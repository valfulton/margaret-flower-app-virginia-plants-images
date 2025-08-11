import { supabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

const ALLOWED = [
  '1margaret.e.fisher@gmail.com',
  'georgerfisher@gmail.com',
].map(e => e.toLowerCase());

interface SearchParams {
  debug?: string;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sb = await supabaseServer();
  const {
    data: { session },
  } = await sb.auth.getSession();

  const email = (session?.user?.email ?? '').toLowerCase();
  const isAllowed = !!session && ALLOWED.includes(email);
  
  const resolvedSearchParams = await searchParams;

  // Debug view: don't redirect; show what we see
  if (resolvedSearchParams?.debug === '1') {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin (Debug)</h1>
        <ul className="text-sm space-y-2">
          <li><strong>Signed in:</strong> {session ? 'yes' : 'no'}</li>
          <li><strong>Email:</strong> {email || '(none)'}</li>
          <li><strong>Allowed:</strong> {isAllowed ? 'yes' : 'no'}</li>
          <li><strong>Allowed list:</strong> {ALLOWED.join(', ')}</li>
        </ul>
        {!isAllowed && <p className="mt-6 text-rose-700">If this says “no”, it would normally redirect to /login.</p>}
      </main>
    );
  }

  // Normal behavior
  if (!isAllowed) redirect('/login');

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Admin</h1>
      <p className="text-sm text-gray-700">
        Signed in as: <strong>{session!.user!.email}</strong>
      </p>
    </main>
  );
}