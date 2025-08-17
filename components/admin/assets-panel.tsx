'use client';

import IconsUploader from './icons-uploader';
import ImageUploader from './image-uploader';
import { useState } from 'react';

export default function AssetsPanel() {
  const [lastIcon, setLastIcon] = useState<string | null>(null);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  return (
    <section className="rounded-xl border p-4 space-y-4">
      <h2 className="text-lg font-semibold">Assets</h2>
      <p className="text-sm text-gray-600">
        Upload <strong>icons</strong> to the <code>icons</code> bucket and <strong>photos</strong> to the <code>flowers</code> bucket.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <IconsUploader onUploaded={(name) => setLastIcon(name)} />

        {/* Flower photos uploader (standalone, does not set a DB row) */}
        <ImageUploader
          bucket="flowers"
          currentName={lastPhoto}
          onUploaded={(name) => setLastPhoto(name)}
        />
      </div>

      {(lastIcon || lastPhoto) && (
        <div className="text-xs text-gray-600">
          {lastIcon && <>Last icon: <code>{lastIcon}</code><br/></>}
          {lastPhoto && <>Last photo: <code>{lastPhoto}</code></>}
        </div>
      )}
    </section>
  );
}