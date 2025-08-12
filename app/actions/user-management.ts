// app/actions/user-management.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { isSuperUser, addAdminUser, removeAdminUser as removeAdminUserFromDB } from '@/lib/admin-users';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function inviteUser(email: string, currentUserEmail: string) {
  try {
    // Check if current user is a super user (dynamic check)
    const isCurrentUserSuper = await isSuperUser(currentUserEmail);
    if (!isCurrentUserSuper) {
      return { error: 'Only super users can invite new users' };
    }

    // Validate email
    if (!email || !email.includes('@')) {
      return { error: 'Please enter a valid email address' };
    }

    // Send invitation
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    });

    if (error) {
      console.error('Invitation error:', error);
      return { error: error.message };
    }

    // Add user to admin_users table
    const addResult = await addAdminUser(email, currentUserEmail, false);
    if (!addResult.success && !addResult.error?.includes('already an admin')) {
      console.warn('Failed to add user to admin_users table:', addResult.error);
      // Don't fail the invitation for this, but log it
    }

    return { 
      success: true, 
      message: `Invitation sent to ${email}. They will receive an email to set up their account.`,
      user: data.user 
    };
  } catch (error: any) {
    console.error('Server error inviting user:', error);
    return { error: 'Failed to send invitation. Please try again.' };
  }
}

export async function listUsers(currentUserEmail: string) {
  try {
    // Check if current user is a super user
    const SUPER_USERS = ['1margaret.e.fisher@gmail.com', 'georgerfisher@gmail.com'];
    if (!SUPER_USERS.includes(currentUserEmail.toLowerCase())) {
      return { error: 'Only super users can view user list' };
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('List users error:', error);
      return { error: error.message };
    }

    // Filter to relevant users only
    const filteredUsers = data.users.filter(user => 
      user.email && (
        user.email.includes('gmail.com') || 
        user.email.includes('fisher') ||
        SUPER_USERS.includes(user.email.toLowerCase())
      )
    );

    return { success: true, users: filteredUsers };
  } catch (error: any) {
    console.error('Server error listing users:', error);
    return { error: 'Failed to load users. Please try again.' };
  }
}

export async function removeUser(userId: string, userEmail: string, currentUserEmail: string) {
  try {
    // Check if current user is a super user
    const SUPER_USERS = ['1margaret.e.fisher@gmail.com', 'georgerfisher@gmail.com'];
    if (!SUPER_USERS.includes(currentUserEmail.toLowerCase())) {
      return { error: 'Only super users can remove users' };
    }

    // Don't allow removing super users
    if (SUPER_USERS.includes(userEmail.toLowerCase())) {
      return { error: 'Cannot remove super users' };
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Remove user error:', error);
      return { error: error.message };
    }

    return { 
      success: true, 
      message: `Removed access for ${userEmail}` 
    };
  } catch (error: any) {
    console.error('Server error removing user:', error);
    return { error: 'Failed to remove user. Please try again.' };
  }
}
