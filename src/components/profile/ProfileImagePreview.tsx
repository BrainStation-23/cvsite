import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProfileImagePreviewProps {
  currentImageUrl?: string | null;
  userName: string;
  isEditing: boolean;
  uploading: boolean;
}

const ProfileImagePreview: React.FC<ProfileImagePreviewProps> = ({ currentImageUrl, userName }) => (
  <div className="relative w-64" data-tour="profile-image">
    <AspectRatio ratio={3/4} className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
      {currentImageUrl ? (
        <img
          src={currentImageUrl}
          alt={userName}
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400 dark:text-gray-500 mb-2">
              {userName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No image uploaded</p>
          </div>
        </div>
      )}
    </AspectRatio>
  </div>
);

export default ProfileImagePreview;
