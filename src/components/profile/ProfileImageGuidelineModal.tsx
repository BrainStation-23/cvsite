import React, { useState } from 'react';

interface ProfileImageGuidelineModalProps {
  show: boolean;
  onClose: () => void;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  uploading: boolean;
  onValidFile: (file: File) => Promise<void>;
}

const EXAMPLES = [
  {
    src: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?auto=format&fit=facearea&w=400&h=400&facepad=2&sat=-100',
    label: 'Good',
    border: 'border-green-400',
    reason: 'Clear, professional headshot with centered face and neutral background.',
    color: 'text-green-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&sat=-100',
    label: 'Too Dark',
    border: 'border-red-400',
    reason: 'Poor lighting makes the face unclear. Use a well-lit photo.',
    color: 'text-red-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2',
    label: 'Obstructed',
    border: 'border-red-400',
    reason: 'Face is not fully visible (e.g., sunglasses or objects blocking).',
    color: 'text-red-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1650784854790-fb6c2ed400d3?auto=format&fit=facearea&w=400&h=400&facepad=2',
    label: 'Group Photo',
    border: 'border-red-400',
    reason: 'Avoid group shots. Only your face should be visible and centered.',
    color: 'text-red-700',
  },
];

const ProfileImageGuidelineModal: React.FC<ProfileImageGuidelineModalProps> = ({
  show,
  onClose,
  dragActive,
  setDragActive,
  uploading,
  onValidFile,
}) => {
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  // Validate file size before upload
  const IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/tiff',
    'image/svg+xml',
  ];

  const handleValidatedFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setError('File must be an image (jpeg, png, gif, bmp, webp, tiff, svg).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB.');
      return;
    }
    setError(null);
    try {
      await onValidFile(file);
      onClose();
    } catch (e) {
      setError('Upload failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleValidatedFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleValidatedFile(e.dataTransfer.files?.[0]);
  };

  const handleModalClose = () => {
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h4 className="font-semibold text-blue-700 mb-4 text-lg">Profile Image Guidelines</h4>
        <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1 mb-6">
          <li>Use a recent, clear, and professional headshot.</li>
          <li>Face should be centered and visible (no sunglasses, hats, or heavy filters).</li>
          <li>High resolution, well-lit, neutral background preferred.</li>
          <li>File format: JPG or PNG. Max size: 5MB.</li>
          <li>Avoid group photos, logos, or full-body shots.</li>
        </ul>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {EXAMPLES.map(example => (
            <div key={example.label} className="flex flex-col items-center">
              <div className={`w-32 h-32 rounded-lg overflow-hidden border-2 ${example.border} bg-gray-100 flex items-center justify-center`}>
                <img src={example.src} alt={example.label + ' Example'} className="object-cover w-full h-full" />
              </div>
              <span className={`text-sm font-semibold mt-2 ${example.color}`}>{example.label}</span>
              <span className="text-xs text-gray-700 dark:text-gray-200 text-center mt-1">{example.reason}</span>
            </div>
          ))}
        </div>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 dark:bg-gray-800'}`}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
          onDrop={handleDrop}
        >
          <input
            id="profile-image-upload-modal"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/bmp,image/webp,image/tiff,image/svg+xml"
            className="hidden"
            onChange={handleInputChange}
            disabled={uploading}
          />
          <label htmlFor="profile-image-upload-modal" className="block cursor-pointer">
            <span className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">Click or drag and drop an image here to upload</span>
            <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors text-sm">Choose File</span>
          </label>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">JPG or PNG, max 5MB</p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileImageGuidelineModal;
