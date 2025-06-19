
import React from 'react';
import ProfileImageAnalysisResult from '../ProfileImageAnalysisResult';
import { ImageAnalysisResult } from './types';

interface AnalysisResultsAreaProps {
  isAnalyzing: boolean;
  analysisResult: ImageAnalysisResult | null;
  showResults: boolean;
}

const AnalysisResultsArea: React.FC<AnalysisResultsAreaProps> = ({
  isAnalyzing,
  analysisResult,
  showResults,
}) => {
  if (!showResults) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Analysis Results
      </h3>
      
      <div className="flex-1 overflow-y-auto">
        <ProfileImageAnalysisResult 
          result={analysisResult} 
          isAnalyzing={isAnalyzing} 
        />
      </div>
    </div>
  );
};

export default AnalysisResultsArea;
