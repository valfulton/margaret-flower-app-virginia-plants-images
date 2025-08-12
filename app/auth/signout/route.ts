// app/auth/signout/route.ts
import { supabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

export async function POST() {
  const supabase = await supabaseServer();
  
  await supabase.auth.signOut();
  
  redirect('/login');
}
