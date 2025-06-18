import React from 'react';
import { Upload } from 'lucide-react';

interface GuidelineDropzoneProps {
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  uploading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GuidelineDropzone: React.FC<GuidelineDropzoneProps> = ({
  dragActive,
  setDragActive,
  uploading,
  isAnalyzing,
  error,
  handleInputChange,
}) => (
  <div
    className={`flex flex-col items-center justify-center border-2 border-dotted rounded-lg transition-colors duration-150 cursor-pointer px-6 py-8 mb-4 select-none relative w-full h-full min-h-[360px] ${
      dragActive
        ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500'
    }`}
    onDragOver={e => {
      e.preventDefault();
      setDragActive(true);
    }}
    onDragLeave={e => {
      e.preventDefault();
      setDragActive(false);
    }}
    style={{ minHeight: 360 }}
  >
    <input
      id="profile-image-upload-modal"
      type="file"
      accept="image/jpeg,image/png,image/gif,image/bmp,image/webp,image/tiff,image/svg+xml"
      className="hidden"
      onChange={handleInputChange}
      disabled={uploading || isAnalyzing}
    />
    <label htmlFor="profile-image-upload-modal" className="block cursor-pointer">
      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <span className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
        Drop your image here
      </span>
      <span className="block text-sm text-gray-500 dark:text-gray-400 mb-4">
        or click to browse
      </span>
    </label>
    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">JPG or PNG, max 5MB</p>
    {error && (
      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )}
  </div>
);

export default GuidelineDropzone;
