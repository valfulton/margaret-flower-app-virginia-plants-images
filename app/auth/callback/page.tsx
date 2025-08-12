'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function AuthCallbackContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const [debug, setDebug] = useState<{ url?: string; search?: string; hash?: string; status: string }>({
    status: 'Waiting…',
  });

  useEffect(() => {
    (async () => {
      try {
        const url = window.location.href;
        const search = window.location.search;
        const hash = window.location.hash;

                       const searchCode = sp.get('code');
               const hp = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
               const hashCode = hp.get('code');
               const access_token = hp.get('access_token');
               const refresh_token = hp.get('refresh_token');
               
               // Check for errors in URL (expired links, etc.)
               const error = sp.get('error') || hp.get('error');
               const errorDescription = sp.get('error_description') || hp.get('error_description');
               const type = sp.get('type') || hp.get('type');
               
               if (error) {
                 let errorMessage = `Auth error: ${error}. ${errorDescription || ''}`;
                 let redirectPath = '/login';
                 
                 // Special handling for invitation links
                 if (type === 'invite' || error === 'signup_disabled') {
                   errorMessage = 'This invitation link has expired or is invalid. Please request a new invitation from an admin.';
                   redirectPath = '/login?tab=reset'; // Direct to password reset tab
                 }
                 
                 setDebug((d) => ({ ...d, status: errorMessage }));
                 
                 // Auto-redirect after 5 seconds for expired invitations
                 setTimeout(() => {
                   window.location.href = redirectPath;
                 }, 5000);
                 return;
               }

        setDebug({
          url,
          search,
          hash,
          status: `Parsed → searchCode=${Boolean(searchCode)} hashCode=${Boolean(hashCode)} at=${Boolean(
            access_token
          )} rt=${Boolean(refresh_token)}`,
        });

        // PKCE code flow (?code= or #code=)
        if (searchCode || hashCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) return setDebug((d) => ({ ...d, status: `exchangeCodeForSession error: ${error.message}` }));
          
          // Wait a moment for session to be established
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if we have a session now
          const { data: { session } } = await supabase.auth.getSession();
          
          const userEmail = session?.user?.email || 'none';
          // Note: We'll let the admin page handle the dynamic permission check
          const isAllowed = true; // Assume allowed for now, admin page will verify
          
          setDebug((d) => ({ ...d, status: `Signed in: ${userEmail}. Email verified: ${session?.user?.email_confirmed_at || 'no'}. Allowed: ${isAllowed}. Redirecting in 15 seconds…` }));
          // Wait much longer to let user read the debug info
          await new Promise(resolve => setTimeout(resolve, 15000));
          // Force a hard redirect to ensure server-side sees the session
          window.location.href = '/admin';
          return;
        }

        // Hash token flow (#access_token & #refresh_token)
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) return setDebug((d) => ({ ...d, status: `setSession error: ${error.message}` }));
          
          // Wait a moment for session to be established
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setDebug((d) => ({ ...d, status: 'Signed in via tokens. Redirecting…' }));
          // Force a hard redirect to ensure server-side sees the session
          window.location.href = '/admin';
          return;
        }

        setDebug((d) => ({ ...d, status: 'No auth code or tokens found in URL.' }));
      } catch (e: unknown) {
        setDebug((d) => ({ ...d, status: `Unhandled error: ${e instanceof Error ? e.message : 'unknown'}` }));
      }
    })();
  }, [router, sp]);

           return (
           <main className="mx-auto max-w-xl p-6">
             <h1 className="text-2xl font-semibold mb-2">Authenticating…</h1>
             <p className="text-sm text-gray-600 mb-4">{debug.status}</p>
             
             {/* Manual navigation buttons */}
             <div className="mb-4 space-x-3">
               <button
                 onClick={() => window.location.href = '/login'}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
               >
                 Go to Login
               </button>
               <button
                 onClick={() => window.location.href = '/admin?debug=bypass'}
                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
               >
                 Admin (Bypass)
               </button>
             </div>
             
             <details className="rounded border p-3 bg-gray-50">
               <summary className="cursor-pointer">Debug details</summary>
               <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(debug, null, 2)}</pre>
             </details>
           </main>
         );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl p-6">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}