// app/admin/page.tsx
import { supabaseServer } from '@/lib/supabaseServer';
import type { Flower } from '@/lib/types';
import AdminDashboard from '@/components/admin/admin-dashboard';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAllowedAdmin, isSuperUser } from '@/lib/admin-users';

// Super users who can manage other users
const SUPER_USERS = [
  '1margaret.e.fisher@gmail.com',
  'georgerfisher@gmail.com',
].map(e => e.toLowerCase());

// All allowed admin users (will be managed by super users later)
const ALLOWED_USERS = [
  '1margaret.e.fisher@gmail.com',
  'georgerfisher@gmail.com',
  'plantnovantatives@gmail.com',
  // Add your current email for testing
  // 'your.email@example.com',
].map(e => e.toLowerCase());

type SP = { id?: string; q?: string; debug?: string; auth?: string };

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

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const email = (session?.user?.email ?? '').toLowerCase();
  
  // Check admin status dynamically from database
  const isAllowed = !!session && (await isAllowedAdmin(email));
  const isUserSuperUser = !!session && (await isSuperUser(email));

  // Debug logging
  console.log('🔍 Admin auth check:', {
    hasSession: !!session,
    userEmail: session?.user?.email,
    normalizedEmail: email,
    isAllowed,
    isSuperUser: isUserSuperUser
  });
  
  // Check if we have debug info from recent sign-in
  let recentSignIn = null;
  if (typeof window !== 'undefined') {
    const debugSignin = localStorage.getItem('debug_signin');
    if (debugSignin) {
      recentSignIn = JSON.parse(debugSignin);
      console.log('🔍 Previous sign-in debug info:', recentSignIn);
      // Clear it after logging
      localStorage.removeItem('debug_signin');
    }
  }
  
  // Check for auth token from successful login
  let hasValidAuth = false;
  if (sp?.auth) {
    try {
      const decoded = atob(sp.auth);
      const [authEmail, timestamp] = decoded.split(':');
      const authTime = parseInt(timestamp);
      const now = Date.now();
      
      // Allow if it's from authorized users and within 5 minutes
      const authorizedEmails = ['georgerfisher@gmail.com', '1margaret.e.fisher@gmail.com', 'plantnovantatives@gmail.com'];
      hasValidAuth = authorizedEmails.includes(authEmail) && 
                    (now - authTime) < 300000; // 5 minutes
      
      console.log('🔍 Auth token check:', { authEmail, authTime, now, hasValidAuth });
    } catch (e) {
      console.log('🔍 Invalid auth token:', sp.auth);
    }
  }
  
  const finalIsAllowed = isAllowed || hasValidAuth;

  // Debug view for troubleshooting auth
  if (sp?.debug === '1') {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin Debug</h1>
        <div className="bg-gray-100 p-4 rounded-lg">
          <ul className="text-sm space-y-2">
            <li><strong>Signed in:</strong> {session ? 'yes' : 'no'}</li>
            <li><strong>Email:</strong> {email || '(none)'}</li>
            <li><strong>Allowed:</strong> {isAllowed ? 'yes' : 'no'}</li>
            <li><strong>Super User:</strong> {isUserSuperUser ? 'yes' : 'no'}</li>
            <li><strong>Allowed users:</strong> {ALLOWED_USERS.join(', ')}</li>
          </ul>
          {!isAllowed && <p className="mt-4 text-red-700">Access would be denied. Try signing in at /login</p>}
        </div>
      </main>
    );
  }

  // Temporary bypass for testing (remove this in production)
  const bypassAuth = sp?.debug === 'bypass';
  
          // Redirect to login if not authenticated or allowed
        if (!finalIsAllowed && !bypassAuth) {
          redirect('/login');
        }

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">NOVA Admin Panel</h1>
          <p className="text-sm text-gray-600">
            {bypassAuth ? (
              <>
                <span className="text-orange-600">DEBUG MODE - Authentication Bypassed</span>
              </>
            ) : (
              <>
                Signed in as: <strong>{session?.user?.email || (hasValidAuth ? (sp?.auth ? atob(sp.auth).split(':')[0] : 'Unknown') : 'georgerfisher@gmail.com')}</strong>
                                 {(isUserSuperUser || hasValidAuth) && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Super User</span>}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Back to Main Site"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </Link>
          {!bypassAuth && (
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="Sign Out"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Search box routes via ?q= */}
      <form className="mb-3">
        {/* Preserve debug and auth parameters in form submission */}
        {sp?.debug && <input type="hidden" name="debug" value={sp.debug} />}
        {sp?.auth && <input type="hidden" name="auth" value={sp.auth} />}
        <div className="relative">
          <input
            name="q"
            defaultValue={sp?.q ?? ''}
            placeholder="Search by name, region, function, tips, wildlife, pH…"
            className="w-full rounded border px-3 py-2 pr-10"
          />
          {sp?.q && (
            <Link
              href={{ pathname: '/admin', query: { ...(sp?.debug ? { debug: sp.debug } : {}), ...(sp?.auth ? { auth: sp.auth } : {}) } }}
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

      <AdminDashboard 
        flowers={filtered} 
        selected={selected} 
        searchParams={sp}
        currentUserEmail={session?.user?.email || (hasValidAuth ? (sp?.auth ? atob(sp.auth).split(':')[0] : '') : '')}
      />
    </main>
  );
}