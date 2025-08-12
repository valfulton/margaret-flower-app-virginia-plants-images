// lib/admin-users.ts
import { supabaseServer } from './supabaseServer';
import { createClient } from '@supabase/supabase-js';

// Fallback lists (used if database is not available)
const FALLBACK_SUPER_USERS = [
  '1margaret.e.fisher@gmail.com',
  'georgerfisher@gmail.com',
].map(e => e.toLowerCase());

const FALLBACK_ALLOWED_USERS = [
  '1margaret.e.fisher@gmail.com',
  'georgerfisher@gmail.com',
  'plantnovantatives@gmail.com',
].map(e => e.toLowerCase());

export interface AdminUser {
  id: number;
  email: string;
  is_super_user: boolean;
  created_at: string;
  created_by: string | null;
  active: boolean;
}

// Get admin users from database (server-side only)
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('active', true)
      .order('created_at');

    if (error) {
      console.warn('Failed to fetch admin users from database:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Database admin users lookup failed:', error);
    return [];
  }
}

// Check if user is allowed admin (with fallback)
export async function isAllowedAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase();
  
  try {
    const adminUsers = await getAdminUsers();
    
    // If we got data from database, use it
    if (adminUsers.length > 0) {
      return adminUsers.some(user => user.email.toLowerCase() === normalizedEmail);
    }
    
    // Fallback to hardcoded list if database not available
    console.warn('Using fallback admin users list');
    return FALLBACK_ALLOWED_USERS.includes(normalizedEmail);
  } catch (error) {
    console.warn('Admin check failed, using fallback:', error);
    return FALLBACK_ALLOWED_USERS.includes(normalizedEmail);
  }
}

// Check if user is super user (with fallback)
export async function isSuperUser(email: string): Promise<boolean> {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase();
  
  try {
    const adminUsers = await getAdminUsers();
    
    // If we got data from database, use it
    if (adminUsers.length > 0) {
      return adminUsers.some(user => 
        user.email.toLowerCase() === normalizedEmail && user.is_super_user
      );
    }
    
    // Fallback to hardcoded list if database not available
    console.warn('Using fallback super users list');
    return FALLBACK_SUPER_USERS.includes(normalizedEmail);
  } catch (error) {
    console.warn('Super user check failed, using fallback:', error);
    return FALLBACK_SUPER_USERS.includes(normalizedEmail);
  }
}

// Add admin user to database (server-side only)
export async function addAdminUser(
  email: string, 
  createdBy: string, 
  isSuperUser: boolean = false
): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  try {
    // Use service role for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        is_super_user: isSuperUser,
        created_by: createdBy.toLowerCase(),
        active: true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return { success: false, error: 'User is already an admin' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add admin user' };
  }
}

// Remove admin user from database (server-side only)
export async function removeAdminUser(
  email: string, 
  removedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Don't allow removing super users
    if (await isSuperUser(email)) {
      return { success: false, error: 'Cannot remove super users' };
    }

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('admin_users')
      .update({ active: false })
      .eq('email', email.toLowerCase());

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove admin user' };
  }
}
