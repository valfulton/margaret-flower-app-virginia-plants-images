// components/admin/admin-dashboard.tsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Flower } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import EnhancedEditor from './enhanced-editor';
import UploadsPanel from './uploads-panel';
import UserManagement from './user-management';
import { useState, Suspense } from 'react';

type Props = {
  flowers: Flower[];
  selected: Flower | null;
  searchParams?: any;
  currentUserEmail?: string;
};

export default function AdminDashboard({ flowers, selected, searchParams, currentUserEmail }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const q = (sp.get('q') ?? '').trim();
  const debug = sp.get('debug'); // Preserve debug parameter
  const auth = sp.get('auth'); // Preserve auth parameter
  const [isUploadsPanelOpen, setIsUploadsPanelOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  
  // Check if current user is a super user
  const SUPER_USERS = ['1margaret.e.fisher@gmail.com', 'georgerfisher@gmail.com'];
  const isSuperUser = currentUserEmail && SUPER_USERS.includes(currentUserEmail.toLowerCase());

  // close modal = drop ?id= from URL (keep q, debug, and auth)
  const closeModal = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete('id');
    router.replace(`/admin${params.toString() ? `?${params.toString()}` : ''}`);
    router.refresh();
  };

  return (
    <>
      {/* Action buttons */}
      <div className="mb-6 flex items-center gap-3">
                       <Link
                 href={{ pathname: '/admin', query: { id: 0, ...(q ? { q } : {}), ...(debug ? { debug } : {}), ...(auth ? { auth } : {}) } }}
                 scroll={false}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Flower
        </Link>
        
                       <button
                 onClick={() => setIsUploadsPanelOpen(true)}
                 className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
               >
                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                 </svg>
                 Upload Images
               </button>
               
               {isSuperUser && (
                 <button
                   onClick={() => setIsUserManagementOpen(true)}
                   className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white font-semibold hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                 >
                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                   </svg>
                   Manage Users
                 </button>
               )}
      </div>

      {/* grid: whole card is a link so clicking name opens modal */}
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {flowers.map((f) => (
          <li key={f.id}>
            <Link
              href={{ pathname: '/admin', query: { id: f.id, ...(q ? { q } : {}), ...(debug ? { debug } : {}), ...(auth ? { auth } : {}) } }}
              scroll={false}
              className="block rounded border px-3 py-2 hover:bg-gray-50"
            >
              <div className="font-medium">{f.common}</div>
              <div className="text-xs italic text-gray-600">{f.latin}</div>
            </Link>
          </li>
        ))}
      </ul>

      {/* popup editor (opens whenever selected is present) */}
      <Modal
        open={Boolean(selected)}
        onClose={closeModal}
        title={selected?.id ? `Edit: ${selected.common}` : 'New Flower'}
        maxWidth="max-w-6xl"
      >
        {selected && (
          <EnhancedEditor
            initial={selected}
            onSaved={closeModal}
            onDeleted={closeModal}
          />
        )}
      </Modal>

      {/* Uploads panel */}
      <Suspense fallback={null}>
        <UploadsPanel
          isOpen={isUploadsPanelOpen}
          onClose={() => setIsUploadsPanelOpen(false)}
        />
      </Suspense>
      
      {/* User Management Panel */}
      <UserManagement 
        isOpen={isUserManagementOpen} 
        onClose={() => setIsUserManagementOpen(false)}
        currentUserEmail={currentUserEmail || ''}
      />
    </>
  );
}