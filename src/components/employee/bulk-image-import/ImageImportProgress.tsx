
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ImageImportProgressProps {
  isProcessing: boolean;
  progress: number;
}

const ImageImportProgress: React.FC<ImageImportProgressProps> = ({ isProcessing, progress }) => {
  if (!isProcessing) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Uploading images...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};

export default ImageImportProgress;
