import { supabaseServer } from './supabaseServer';

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Add your admin logic here
    // For now, checking if user is authenticated
    return !!user;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}
