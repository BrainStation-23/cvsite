
import React from 'react';
import { Button } from '@/components/ui/button';

interface ImageImportActionsProps {
  filesCount: number;
  hasUnmatchedFiles: boolean;
  hasPendingFiles: boolean;
  isProcessing: boolean;
  onReset: () => void;
  onFindProfiles: () => void;
  onStartUpload: () => void;
}

const ImageImportActions: React.FC<ImageImportActionsProps> = ({
  filesCount,
  hasUnmatchedFiles,
  hasPendingFiles,
  isProcessing,
  onReset,
  onFindProfiles,
  onStartUpload
}) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">
        Images to Upload ({filesCount})
      </h3>
      <div className="space-x-2">
        <Button variant="outline" onClick={onReset} disabled={isProcessing}>
          Reset
        </Button>
        {hasUnmatchedFiles && (
          <Button onClick={onFindProfiles} disabled={isProcessing}>
            Find Profiles
          </Button>
        )}
        {hasPendingFiles && (
          <Button onClick={onStartUpload} disabled={isProcessing}>
            Start Upload
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageImportActions;
