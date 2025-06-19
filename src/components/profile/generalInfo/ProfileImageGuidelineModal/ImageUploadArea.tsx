
import React from 'react';
import GuidelineDropzone from './GuidelineDropzone';
import GuidelinePreview from './GuidelinePreview';
import GuidelineAnalysisActions from './GuidelineAnalysisActions';
import { ImageAnalysisResult, ValidationResult } from './types';

interface ImageUploadAreaProps {
  previewImage: string | null;
  isAnalyzing: boolean;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  uploading: boolean;
  error: string | null;
  analysisResult: ImageAnalysisResult | null;
  validationResults: ValidationResult[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProceed: () => void;
  onTryAnother: () => void;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  previewImage,
  isAnalyzing,
  dragActive,
  setDragActive,
  uploading,
  error,
  analysisResult,
  validationResults,
  handleInputChange,
  onProceed,
  onTryAnother,
}) => {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Show upload area when no image is selected */}
      {!previewImage && !isAnalyzing && (
        <GuidelineDropzone
          dragActive={dragActive}
          setDragActive={setDragActive}
          uploading={uploading}
          isAnalyzing={isAnalyzing}
          error={error}
          handleInputChange={handleInputChange}
        />
      )}

      {/* Show preview and actions when image is selected */}
      {(previewImage || isAnalyzing) && (
        <div className="flex flex-col h-full">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Image Preview
          </h3>
          <GuidelinePreview previewImage={previewImage} />

          {/* Recommendations Section */}
          {analysisResult && analysisResult.details?.recommendations?.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3 mt-2">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                  <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Recommendations:
                  </h5>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    {analysisResult.details.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-blue-400">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {analysisResult && (
            <GuidelineAnalysisActions
              uploading={uploading}
              onProceed={onProceed}
              onTryAnother={onTryAnother}
              allPassed={validationResults.every(item => item.passed)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadArea;
