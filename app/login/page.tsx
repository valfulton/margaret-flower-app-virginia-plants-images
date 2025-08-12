import { supabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SignIn from '@/components/admin/sign-in';

const ALLOWED = [
  '1margaret.e.fisher@gmail.com',
  'georgerfisher@gmail.com',
].map(e => e.toLowerCase());

interface SearchParams {
  debug?: string;
}

export default async function LoginPage({
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

  // If already authenticated and allowed, redirect to admin
  if (isAllowed) {
    redirect('/admin');
  }

  // Show login form for unauthenticated users
  return (
    <main className="mx-auto max-w-lg p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NOVA Admin Login</h1>
        <p className="text-gray-600">Northern Virginia Native Plants Database</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Access Required</h2>
        <p className="text-gray-700 mb-6">
          This admin panel is restricted to authorized users only. Please enter your email address to receive a secure login link.
        </p>
        
        <SignIn />
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Need Access?</h3>
          <p className="text-sm text-blue-800">
            Contact Margaret Fisher (1margaret.e.fisher@gmail.com) or George Fisher (georgerfisher@gmail.com) to request admin access.
          </p>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <Link 
          href="/" 
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Plant Database
        </Link>
      </div>
    </main>
  );
}