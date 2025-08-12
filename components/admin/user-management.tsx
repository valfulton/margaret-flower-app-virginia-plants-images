// components/admin/user-management.tsx
'use client';

import { useState, useEffect } from 'react';
import { inviteUser, listUsers, removeUser } from '@/app/actions/user-management';

interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

export default function UserManagement({ isOpen, onClose, currentUserEmail }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Super users who can manage other users (keep for now, will be dynamic in future)
  const SUPER_USERS = ['1margaret.e.fisher@gmail.com', 'georgerfisher@gmail.com'];
  const isSuperUser = SUPER_USERS.includes(currentUserEmail.toLowerCase());

  // Load existing users
  const loadUsers = async () => {
    if (!isSuperUser) return;
    
    setLoadingUsers(true);
    try {
      const result = await listUsers(currentUserEmail);
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.success && result.users) {
        setUsers(result.users as User[]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load users. Please try again.' });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Add new user (invite them to create account)
  const addUser = async () => {
    if (!newUserEmail.trim() || !isSuperUser) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      const result = await inviteUser(newUserEmail.trim(), currentUserEmail);
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Invitation sent successfully!' });
        setNewUserEmail('');
        // Reload users list
        await loadUsers();
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to send invitation. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove user access (this doesn't delete the user, just removes them from allowed list)
  const handleRemoveUser = async (userId: string, email: string) => {
    if (!isSuperUser || SUPER_USERS.includes(email.toLowerCase())) {
      setMessage({ type: 'error', text: 'Cannot remove super users or insufficient permissions.' });
      return;
    }
    
    setLoading(true);
    try {
      const result = await removeUser(userId, email, currentUserEmail);
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.success) {
        setMessage({ type: 'success', text: result.message || 'User removed successfully' });
        await loadUsers();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to remove user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Load users when panel opens
  if (isOpen && users.length === 0 && !loadingUsers) {
    loadUsers();
  }

  if (!isOpen) return null;

  if (!isSuperUser) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
        <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.924-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">
                Only super users can manage other users. Contact Margaret Fisher or George Fisher for user management.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Add New User */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">👥 Invite New Admin User</h3>
            <div className="flex gap-3">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Enter email address..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={addUser}
                disabled={loading || !newUserEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
            <div className="text-xs text-blue-600 mt-2 space-y-1">
              <p>💡 The user will receive an email invitation to set up their account and password.</p>
              <p>⚠️ If the invitation link doesn't work, tell them to use "Set Password" on the login page instead.</p>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Users List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Current Admin Users</h3>
            
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No users found or unable to load users.</p>
                <p className="text-xs mt-1">This feature requires special admin privileges.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{user.email}</span>
                          {SUPER_USERS.includes(user.email?.toLowerCase() || '') && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Super User
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                          {user.email_confirmed_at && (
                            <span className="ml-3 text-green-600">✅ Email Verified</span>
                          )}
                        </div>
                      </div>
                      
                      {!SUPER_USERS.includes(user.email?.toLowerCase() || '') && (
                        <button
                          onClick={() => handleRemoveUser(user.id, user.email || '')}
                          disabled={loading}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 disabled:opacity-50"
                        >
                          Remove Access
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">ℹ️ User Management Info</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Super Users</strong> can invite and manage other admin users</li>
              <li>• <strong>Invited users</strong> receive an email to set up their account</li>
              <li>• <strong>Super Users</strong> cannot be removed by other users</li>
              <li>• <strong>Admin access</strong> is required to manage plant database</li>
            </ul>
          </div>

          {/* Close Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
