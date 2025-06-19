
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
