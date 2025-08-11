// components/admin/sign-in.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SignIn({ initialEmail = '' }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/admin` },
    });
    if (error) setErr(error.message);
    else setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-3">
      <label className="block text-sm font-medium">Email</label>
      <input
        className="w-full rounded-md border px-3 py-2"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">Send magic link</button>
      {sent && <p className="text-sm text-green-700">Check your email for the sign-in link.</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </form>
  );
}