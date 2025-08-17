'use client';

import FileUploader from './file-uploader';

export default function IconsUploader({
  onUploaded,
}: { onUploaded?: (name: string) => void }) {
  return (
    <FileUploader
      title="Upload icon → icons bucket"
      bucket="icons"
      accept="image/png,image/webp,image/svg+xml"
      maxBytes={300 * 1024}        // 300KB
      maxWidth={256}
      maxHeight={256}
      mustBeSquare={true}
      nameHint="Use short names like sun_full.png, deer_resistant.svg (≤256×256, ≤300KB)."
      onUploaded={onUploaded}
    />
  );
}