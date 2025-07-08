
import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import ValidationProgressChecklist from './ProfileImageGuidelineModal/ValidationProgressChecklist';
import { ValidationProgress } from './ProfileImageGuidelineModal/types';

interface ImageAnalysisResult {
  isProfessionalHeadshot: boolean;
  isFaceCentered: boolean;
  hasNoSunglassesOrHats: boolean;
  isNotGroupPhoto: boolean;
  confidence: number;
  details: {
    faceCount: number;
    glasses: string;
    accessories: string[];
    facePosition: string;
    recommendations: string[];
  };
  background?: {
    passed: boolean;
    details: string;
  };
  posture?: {
    passed: boolean;
    shoulderAngle: number;
    details: string;
  };
  closeup?: {
    passed: boolean;
    faceHeightRatio: number;
    details: string;
  };
}

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
          <div className="flex items-center justify-between">
            <span>Single person (not group photo)</span>
            {getStatusIcon(result.isNotGroupPhoto)}
          </div>
          <div className="flex items-center justify-between">
            <span>Face centered</span>
            {getStatusIcon(result.isFaceCentered)}
          </div>
          <div className="flex items-center justify-between">
            <span>No sunglasses or hats</span>
            {getStatusIcon(result.hasNoSunglassesOrHats)}
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>Faces detected: {result.details.faceCount}</div>
            {result.details.glasses !== 'unknown' && (
              <div>Glasses: {result.details.glasses}</div>
            )}
            {result.details.accessories.length > 0 && (
              <div>Accessories: {result.details.accessories.join(', ')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {result.details.recommendations.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Recommendations:
              </h5>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                {result.details.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-blue-400">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageAnalysisResult;
