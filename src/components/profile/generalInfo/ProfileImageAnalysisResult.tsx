
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import ValidationProgressChecklist from './ProfileImageGuidelineModal/ValidationProgressChecklist';
import { ValidationProgress } from './ProfileImageGuidelineModal/types';
import { ImageAnalysisResult } from './ProfileImageGuidelineModal/types';

interface ProfileImageAnalysisResultProps {
  result: ImageAnalysisResult | null;
  isAnalyzing: boolean;
  validationProgress?: ValidationProgress[];
}

const ProfileImageAnalysisResult: React.FC<ProfileImageAnalysisResultProps> = ({
  result,
  isAnalyzing,
  validationProgress = []
}) => {
  // Show progress checklist during analysis or if we have progress data
  if (isAnalyzing || validationProgress.length > 0) {
    return (
      <div className="space-y-4">
        <ValidationProgressChecklist 
          progress={validationProgress} 
          isAnalyzing={isAnalyzing} 
        />
      </div>
    );
  }

  // Don't render anything if there's no result and not analyzing
  if (!result) {
    return null;
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Detailed Criteria */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Final Results:</h4>
        
        <div className="grid grid-cols-1 gap-2 text-sm">
          {result.background && (
            <div className="flex items-center justify-between">
              <span>Background is solid</span>
              <span className="flex items-center gap-1">
                {getStatusIcon(result.background.passed)}
                <span className="text-xs text-gray-500">{result.background.details}</span>
              </span>
            </div>
          )}
          {result.posture && (
            <div className="flex items-center justify-between">
              <span>Good posture (5-20° shoulder angle)</span>
              <span className="flex items-center gap-1">
                {getStatusIcon(result.posture.passed)}
                <span className="text-xs text-gray-500">
                  {result.posture.shoulderAngle > 0 ? `${result.posture.shoulderAngle.toFixed(1)}°` : result.posture.details}
                </span>
              </span>
            </div>
          )}
          {result.closeup && (
            <div className="flex items-center justify-between">
              <span>Close-up shot (face ≥30% of image height)</span>
              <span className="flex items-center gap-1">
                {getStatusIcon(result.closeup.passed)}
                <span className="text-xs text-gray-500">
                  {result.closeup.faceHeightRatio > 0 ? `${result.closeup.faceHeightRatio}%` : result.closeup.details}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileImageAnalysisResult;
