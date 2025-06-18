import React from 'react';

interface GuidelinePreviewProps {
  previewImage: string | null;
}

const GuidelinePreview: React.FC<GuidelinePreviewProps> = ({ previewImage }) => {
  if (!previewImage) return null;
  return (
    <div className="flex justify-center mb-4">
      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-sm">
        <img
          src={previewImage}
          alt="Preview"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};

export default GuidelinePreview;
