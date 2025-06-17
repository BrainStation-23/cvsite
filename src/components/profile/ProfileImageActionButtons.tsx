import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Upload } from 'lucide-react';

interface ProfileImageActionButtonsProps {
  uploading: boolean;
  deleting: boolean;
  currentImageUrl?: string | null;
  onUploadClick: () => void;
  onRemoveClick: () => void;
}

const ProfileImageActionButtons: React.FC<ProfileImageActionButtonsProps> = ({
  uploading,
  deleting,
  currentImageUrl,
  onUploadClick,
  onRemoveClick,
}) => (
  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={uploading}
      className="w-full"
      onClick={onUploadClick}
    >
      <span className="flex items-center justify-center gap-2">
        <Upload className="h-4 w-4" />
        {uploading ? 'Uploading...' : 'Upload Image'}
      </span>
    </Button>
    {currentImageUrl && (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={onRemoveClick}
        disabled={deleting || uploading}
        className="flex-1"
        data-tour="remove-image-button"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {deleting ? 'Removing...' : 'Remove'}
      </Button>
    )}
  </div>
);

export default ProfileImageActionButtons;
