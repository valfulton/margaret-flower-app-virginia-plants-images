// components/admin/admin-dashboard.tsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Flower } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import Editor from './editor';

type Props = {
  flowers: Flower[];
  selected: Flower | null;
};

export default function AdminDashboard({ flowers, selected }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const q = (sp.get('q') ?? '').trim();

  // close modal = drop ?id= from URL (keep q)
  const closeModal = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete('id');
    router.replace(`/admin${params.toString() ? `?${params.toString()}` : ''}`);
    router.refresh();
  };

  return (
    <>
      {/* new */}
      <Link
        href={{ pathname: '/admin', query: { id: 0, ...(q ? { q } : {}) } }}
        scroll={false}
        className="mb-3 inline-block rounded border px-2 py-1 hover:bg-gray-50"
      >
        + New Flower
      </Link>

      {/* grid: whole card is a link so clicking name opens modal */}
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {flowers.map((f) => (
          <li key={f.id}>
            <Link
              href={{ pathname: '/admin', query: { id: f.id, ...(q ? { q } : {}) } }}
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
        maxWidth="max-w-2xl"
      >
        {selected && (
          <Editor
            initial={selected}
            onSaved={closeModal}
            onDeleted={closeModal}
          />
        )}
      </Modal>
    </>
  );
}