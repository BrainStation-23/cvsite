import React from 'react';
import { Button } from '@/components/ui/button';

interface GuidelineAnalysisActionsProps {
  uploading: boolean;
  onProceed: () => void;
  onTryAnother: () => void;
  allPassed: boolean;
}

const GuidelineAnalysisActions: React.FC<GuidelineAnalysisActionsProps> = ({
  uploading,
  onProceed,
  onTryAnother,
  allPassed,
}) => (
  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
    {allPassed && (
      <Button
        type="button"
        onClick={onProceed}
        disabled={uploading}
        className="w-full"
        size="sm"
      >
        {uploading ? 'Uploading...' : 'Use This Image'}
      </Button>
    )}
    <Button
      onClick={onTryAnother}
      variant="outline"
      className="w-full"
      size="sm"
    >
      Try Another Image
    </Button>
  </div>
);

export default GuidelineAnalysisActions;
