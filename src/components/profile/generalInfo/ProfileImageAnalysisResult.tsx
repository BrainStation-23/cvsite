
import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

interface ProfileImageAnalysisResultProps {
  result: ImageAnalysisResult;
  isAnalyzing: boolean;
}

const ProfileImageAnalysisResult: React.FC<ProfileImageAnalysisResultProps> = ({
  result,
  isAnalyzing
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm text-blue-700 dark:text-blue-300">Analyzing image...</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'bg-green-500';
    if (confidence >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Overall Assessment */}
      <div className={`border rounded-lg p-4 ${
        result.isProfessionalHeadshot 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(result.isProfessionalHeadshot)}
            <span className="font-medium">
              {result.isProfessionalHeadshot ? 'Professional Headshot' : 'Needs Improvement'}
            </span>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(result.confidence)}`}></div>
            {result.confidence}% confidence
          </Badge>
        </div>
      </div>

      {/* Detailed Criteria */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Analysis Details:</h4>
        
        <div className="grid grid-cols-1 gap-2 text-sm">
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
