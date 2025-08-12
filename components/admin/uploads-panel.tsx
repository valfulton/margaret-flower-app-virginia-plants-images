// components/admin/uploads-panel.tsx
'use client';

import { useState } from 'react';
import EnhancedImageUploader from './enhanced-image-uploader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadsPanel({ isOpen, onClose }: Props) {
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [iconFileName, setIconFileName] = useState<string>('');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upload Images & Icons</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              aria-label="Close uploads panel"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📸 Upload Guidelines</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Flower Photos:</strong> Will be automatically resized to 600×600px</li>
              <li>• <strong>Icons:</strong> Uploaded at original size (keep small ~50px)</li>
              <li>• <strong>Formats:</strong> JPG, PNG, or WebP only</li>
              <li>• <strong>Size Limit:</strong> 2MB maximum per file</li>
              <li>• <strong>Naming:</strong> Files will be renamed automatically</li>
            </ul>
          </div>

          {/* Upload sections */}
          <div className="space-y-6">
            {/* Photos uploader */}
            <EnhancedImageUploader
              bucket="flowers"
              currentName={photoFileName || null}
              onUploaded={(fileName) => {
                setPhotoFileName(fileName);
                console.log('Photo uploaded:', fileName);
              }}
              type="photo"
              title="🌸 Flower Photos"
            />

            {/* Icons uploader */}
            <EnhancedImageUploader
              bucket="icons"
              currentName={iconFileName || null}
              onUploaded={(fileName) => {
                setIconFileName(fileName);
                console.log('Icon uploaded:', fileName);
              }}
              type="icon"
              title="🔲 Icons & Symbols"
            />
          </div>

          {/* Recent uploads info */}
          {(photoFileName || iconFileName) && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Recent Uploads</h3>
              <div className="text-sm text-green-700 space-y-1">
                {photoFileName && (
                  <div>
                    <strong>Photo:</strong> <code className="bg-green-100 px-1 rounded">{photoFileName}</code>
                  </div>
                )}
                {iconFileName && (
                  <div>
                    <strong>Icon:</strong> <code className="bg-green-100 px-1 rounded">{iconFileName}</code>
                  </div>
                )}
              </div>
              <p className="text-xs text-green-600 mt-2">
                💡 Copy these filenames to use in the flower editor!
              </p>
            </div>
          )}

          {/* Storage info */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">📁 Storage Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Photos are stored in the <code className="bg-gray-200 px-1 rounded">flowers</code> bucket</p>
              <p>• Icons are stored in the <code className="bg-gray-200 px-1 rounded">icons</code> bucket</p>
              <p>• Files can be overwritten by uploading with the same name</p>
              <p>• Use the filename in the flower editor's "Image filename" field</p>
            </div>
          </div>

          {/* Close button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
