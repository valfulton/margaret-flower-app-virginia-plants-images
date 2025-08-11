'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
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
          setDebug((d) => ({ ...d, status: 'Signed in via code. Redirecting…' }));
          router.replace('/admin');
          return;
        }

        // Hash token flow (#access_token & #refresh_token)
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) return setDebug((d) => ({ ...d, status: `setSession error: ${error.message}` }));
          setDebug((d) => ({ ...d, status: 'Signed in via tokens. Redirecting…' }));
          router.replace('/admin');
          return;
        }

        setDebug((d) => ({ ...d, status: 'No auth code or tokens found in URL.' }));
      } catch (e: any) {
        setDebug((d) => ({ ...d, status: `Unhandled error: ${e?.message ?? 'unknown'}` }));
      }
    })();
  }, [router, sp]);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Authenticating…</h1>
      <p className="text-sm text-gray-600 mb-4">{debug.status}</p>
      <details className="rounded border p-3 bg-gray-50">
        <summary className="cursor-pointer">Debug details</summary>
        <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(debug, null, 2)}</pre>
      </details>
    </main>
  );
}