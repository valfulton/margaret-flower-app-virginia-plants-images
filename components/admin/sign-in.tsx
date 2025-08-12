// components/admin/sign-in.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SignIn({ initialEmail = '', initialTab = 'password' }: { initialEmail?: string; initialTab?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'password' | 'magic' | 'reset'>(initialTab as any || 'password');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setErr(error.message);
    } else {
      // Success! Wait a moment for session to be established, then redirect
      console.log('🎉 Sign-in successful:', data.user?.email);
      
      // Verify session is established
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('📝 Session after sign-in:', sessionData.session?.user?.email);
      
      // Store debug info in localStorage so we can see it even after redirect
      localStorage.setItem('debug_signin', JSON.stringify({
        signInUser: data.user?.email,
        sessionUser: sessionData.session?.user?.email,
        timestamp: new Date().toISOString()
      }));
      
      // Show user feedback before redirect
      setErr(`✅ Successfully signed in as ${data.user?.email}. Redirecting to admin panel...`);
      
      // Wait longer for the session to be fully established
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use a special parameter to indicate successful authentication
      const authToken = btoa(data.user?.email + ':' + Date.now());
      window.location.replace(`/admin?auth=${authToken}`);
    }
    setLoading(false);
  };

  const onMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    
    if (error) {
      setErr(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });
    
    if (error) {
      setErr(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md space-y-4">
      {/* Toggle between authentication methods */}
      <div className="grid grid-cols-3 rounded-lg border p-1 bg-gray-50">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`py-2 px-2 text-xs font-medium rounded-md transition-colors ${
            mode === 'password'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('reset')}
          className={`py-2 px-2 text-xs font-medium rounded-md transition-colors ${
            mode === 'reset'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Set Password
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`py-2 px-2 text-xs font-medium rounded-md transition-colors ${
            mode === 'magic'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Magic Link
        </button>
      </div>

      {mode === 'password' && (
        <form onSubmit={onPasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      )}

      {mode === 'reset' && (
        <form onSubmit={onResetSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Password Reset'}
          </button>
          {sent && <p className="text-sm text-green-700">Check your email for the password reset link.</p>}
        </form>
      )}

      {mode === 'magic' && (
        <form onSubmit={onMagicSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
          {sent && <p className="text-sm text-green-700">Check your email for the sign-in link.</p>}
        </form>
      )}
      
      {err && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{err}</p>}
      
      {mode === 'password' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <p><strong>First time?</strong> Click "Set Password" to create your password.</p>
          <p>Your admin account already exists - you just need to set a password.</p>
        </div>
      )}

      {mode === 'reset' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <p><strong>Password Reset:</strong> Enter your admin email address to receive a secure link.</p>
          <p>You'll be able to set a new password that you can use for future logins.</p>
          <p><strong>Note:</strong> Only authorized admin emails will receive reset links.</p>
        </div>
      )}

      {mode === 'magic' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <p><strong>Magic Link:</strong> Get a one-time login link sent to your email.</p>
          <p><strong>⚠️ Warning:</strong> Magic links expire very quickly (within seconds).</p>
          <p><strong>Tip:</strong> Use "Set Password" for a more reliable login method.</p>
        </div>
      )}
    </div>
  );
}