
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileImageAnalysisResult from './ProfileImageAnalysisResult';
import GuidelineDropzone from './ProfileImageGuidelineModal/GuidelineDropzone';
import GuidelinePreview from './ProfileImageGuidelineModal/GuidelinePreview';
import GuidelineAnalysisActions from './ProfileImageGuidelineModal/GuidelineAnalysisActions';
import { validateSolidBackground } from '@/utils/imageBackgroundValidation';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface ProfileImageGuidelineModalProps {
  show: boolean;
  onClose: () => void;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  uploading: boolean;
  onValidFile: (file: File) => Promise<void>;
}

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
}

const EXAMPLES = [
  {
    src: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?auto=format&fit=facearea&w=200&h=200&facepad=2&sat=-100',
    label: 'Good',
    border: 'border-green-400',
    reason: 'Clear, professional headshot',
    color: 'text-green-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=200&h=200&facepad=2&sat=-100',
    label: 'Too Dark',
    border: 'border-red-400',
    reason: 'Poor lighting',
    color: 'text-red-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=200&h=200&facepad=2',
    label: 'Obstructed',
    border: 'border-red-400',
    reason: 'Face not visible',
    color: 'text-red-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1650784854790-fb6c2ed400d3?auto=format&fit=facearea&w=200&h=200&facepad=2',
    label: 'Group Photo',
    border: 'border-red-400',
    reason: 'Multiple people',
    color: 'text-red-700',
  },
];

type ValidationResult = {
  id: string;
  label: string;
  passed: boolean;
  details?: string;
  source: 'local' | 'azure';
};

const ProfileImageGuidelineModal: React.FC<ProfileImageGuidelineModalProps> = ({
  show,
  onClose,
  dragActive,
  setDragActive,
  uploading,
  onValidFile,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!show) {
      // Reset all state when modal is closed
      setError(null);
      setAnalysisResult(null);
      setPreviewImage(null);
      setIsAnalyzing(false);
      setValidationResults([]);
    }
  }, [show]);

  if (!show) return null;

  const IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/tiff',
    'image/svg+xml',
  ];

  const analyzeImage = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setValidationResults([]);

      // 1. Local background check
      let localBgResult: ValidationResult | null = null;
      try {
        const img = await createImageBitmap(file);
        const bg = await validateSolidBackground(img);
        localBgResult = {
          id: 'background',
          label: 'Background is solid',
          passed: bg.isSolid,
          details: `Variance: ${Math.round(bg.score)}`,
          source: 'local',
        };
      } catch (e) {
        localBgResult = {
          id: 'background',
          label: 'Background is solid',
          passed: false,
          details: 'Error running background check',
          source: 'local',
        };
      }
      setValidationResults(localBgResult ? [localBgResult] : []);

      // 2. Call edge function (Azure)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('analyze-profile-image', {
        body: { imageBase64: base64 }
      });
      if (error) throw new Error(error.message);
      
      // Inject background result into AI analysis result
      let recommendations = data.details.recommendations ? [...data.details.recommendations] : [];
      if (localBgResult && localBgResult.passed === false) {
        recommendations.unshift('Use a plain, solid-color background like a wall or curtain.');
      }
      const mergedResult = {
        ...data,
        background: localBgResult ? {
          passed: localBgResult.passed,
          details: localBgResult.details,
        } : undefined,
        details: {
          ...data.details,
          recommendations,
        },
      };

      setAnalysisResult(mergedResult);
      setPreviewImage(base64);

    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('Failed to analyze image. Please try again.');
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleValidatedFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setError('File must be an image (jpeg, png, gif, bmp, webp, tiff, svg).');
      return;
    }
    setError(null);
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB.');
      return;
    }
    setError(null);

    await analyzeImage(file);
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
      setError('Upload failed. Please try again.');
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

  const handleModalClose = () => {
    onClose();
  };

  const handleTryAnother = () => {
    setError(null);
    setAnalysisResult(null);
    setPreviewImage(null);
    setIsAnalyzing(false);
    setValidationResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden relative flex flex-col">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Image Wizard</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleModalClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left Column - Guidelines */}
          <div className="w-80 p-4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Requirements
                </h3>
                <ul className="list-disc pl-4 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Recent, clear headshot</li>
                  <li>Face centered, no sunglasses/hats</li>
                  <li>Well-lit, neutral background</li>
                  <li>JPG/PNG, max 5MB</li>
                  <li>No group photos or logos</li>
                </ul>
              </div>

              {/* Compact Examples */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Examples</h4>
                <div className="grid grid-cols-2 gap-2">
                  {EXAMPLES.map(example => (
                    <div key={example.label} className="space-y-1">
                      <div className={`aspect-square rounded-md overflow-hidden border ${example.border} bg-gray-100`}>
                        <img 
                          src={example.src} 
                          alt={example.label} 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                      <div className="text-center">
                        <span className={`text-xs font-semibold ${example.color}`}>
                          {example.label}
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {example.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Upload/Preview */}
          <div className="flex-1 p-4 flex flex-col min-h-0">
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
                    onProceed={handleProceedWithUpload}
                    onTryAnother={handleTryAnother}
                    allPassed={validationResults.every(item => item.passed)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Column - Analysis Results */}
          <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-700 flex flex-col min-h-0">
            {(isAnalyzing || analysisResult || validationResults.length > 0) && (
              <div className="flex flex-col h-full">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Analysis Results
                </h3>
                
                <div className="flex-1 overflow-y-auto">
                  {/* Only render ProfileImageAnalysisResult if we have a valid analysisResult */}
                  {(isAnalyzing || analysisResult) && (
                    <ProfileImageAnalysisResult 
                      result={analysisResult} 
                      isAnalyzing={isAnalyzing} 
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageGuidelineModal;
