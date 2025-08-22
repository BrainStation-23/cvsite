
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Upload } from 'lucide-react';

interface ForceUploadButtonProps {
  onForceUpload: () => void;
  isUploading: boolean;
  validationErrors: string[];
  disabled?: boolean;
}

const ForceUploadButton: React.FC<ForceUploadButtonProps> = ({
  onForceUpload,
  isUploading,
  validationErrors,
  disabled = false
}) => {
  const hasErrors = validationErrors.length > 0;

  if (!hasErrors) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
              ⚠️ Upload Anyway Warning
            </h5>
            <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
              This image doesn't meet our quality guidelines, but you can still upload it. 
              This action will be logged for audit purposes.
            </p>
            <div className="text-xs text-orange-500">
              Issues found: {validationErrors.join(', ')}
            </div>
          </div>
        </div>
      </div>
      
      <Button
        type="button"
        onClick={onForceUpload}
        disabled={isUploading || disabled}
        variant="destructive"
        className="w-full"
        size="sm"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload Anyway (Override Guidelines)'}
      </Button>
    </div>
  );
};

export default ForceUploadButton;
