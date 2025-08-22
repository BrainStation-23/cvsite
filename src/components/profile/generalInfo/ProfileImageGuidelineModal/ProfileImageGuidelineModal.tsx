
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import GuidelineContent from './GuidelineContent';
import ImageUploadArea from './ImageUploadArea';
import AnalysisResultsArea from './AnalysisResultsArea';
import { useImageAnalysis } from './hooks/useImageAnalysis';
import { useForcedImageUploads } from '@/hooks/use-forced-image-uploads';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileImageGuidelineModalProps } from './types';
import { IMAGE_TYPES } from './constants';

const ProfileImageGuidelineModal: React.FC<ProfileImageGuidelineModalProps> = ({
  show,
  onClose,
  dragActive,
  setDragActive,
  uploading,
  onValidFile,
  profileId,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { user } = useAuth();
  const {
    analysisResult,
    isAnalyzing,
    validationResults,
    validationProgress,
    error,
    analyzeImage,
    resetAnalysis,
  } = useImageAnalysis();
  
  const { recordForcedUpload, isRecording } = useForcedImageUploads();

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!show) {
      setPreviewImage(null);
      resetAnalysis();
    }
  }, [show, resetAnalysis]);

  if (!show) return null;

  const handleValidatedFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    try {
      const base64 = await analyzeImage(file);
      setPreviewImage(base64);
    } catch (e) {
      // Error handled in hook
    }
  };

  const handleProceedWithUpload = async () => {
    if (!previewImage) return;
    
    try {
      const response = await fetch(previewImage);
      const blob = await response.blob();
      const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
      
      await onValidFile(file);
      onClose();
    } catch (e) {
      console.error('Upload failed:', e);
    }
  };

  const handleForceUpload = async () => {
    if (!previewImage || !targetProfileId) return;
    
    try {
      const response = await fetch(previewImage);
      const blob = await response.blob();
      const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
      
      // Get failed validation messages
      const failedValidations = validationResults
        .filter(item => !item.passed)
        .map(item => item.details);

      // Upload the image first
      await onValidFile(file);
      
      // Record the forced upload with validation errors
      await recordForcedUpload({
        profileId: targetProfileId,
        validationErrors: failedValidations,
        imageUrl: previewImage // This will be updated with the actual URL after upload
      });
      
      onClose();
    } catch (e) {
      console.error('Force upload failed:', e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleValidatedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleValidatedFile(file);
    }
  };

  const handleTryAnother = () => {
    setPreviewImage(null);
    resetAnalysis();
  };

  const showResults = isAnalyzing || analysisResult !== null || validationResults.length > 0 || validationProgress.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden relative flex flex-col">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Image Wizard</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="flex-1 flex min-h-0" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
          {/* Left Column - Guidelines */}
          <div className="w-80 p-4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <GuidelineContent />
          </div>

          {/* Middle Column - Upload/Preview */}
          <div className="flex-1 p-4 flex flex-col min-h-0">
            <ImageUploadArea
              previewImage={previewImage}
              isAnalyzing={isAnalyzing}
              dragActive={dragActive}
              setDragActive={setDragActive}
              uploading={uploading || isRecording}
              error={error}
              analysisResult={analysisResult}
              validationResults={validationResults}
              handleInputChange={handleInputChange}
              onProceed={handleProceedWithUpload}
              onTryAnother={handleTryAnother}
              onForceUpload={handleForceUpload}
            />
          </div>

          {/* Right Column - Analysis Results */}
          <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-700 flex flex-col min-h-0">
            <AnalysisResultsArea
              isAnalyzing={isAnalyzing}
              analysisResult={analysisResult}
              validationProgress={validationProgress}
              showResults={showResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageGuidelineModal;
