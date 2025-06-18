
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileImageAnalysisResult from './ProfileImageAnalysisResult';
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
}

const EXAMPLES = [
  {
    src: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?auto=format&fit=facearea&w=400&h=400&facepad=2&sat=-100',
    label: 'Good',
    border: 'border-green-400',
    reason: 'Clear, professional headshot with centered face and neutral background.',
    color: 'text-green-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&sat=-100',
    label: 'Too Dark',
    border: 'border-red-400',
    reason: 'Poor lighting makes the face unclear. Use a well-lit photo.',
    color: 'text-red-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2',
    label: 'Obstructed',
    border: 'border-red-400',
    reason: 'Face is not fully visible (e.g., sunglasses or objects blocking).',
    color: 'text-red-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1650784854790-fb6c2ed400d3?auto=format&fit=facearea&w=400&h=400&facepad=2',
    label: 'Group Photo',
    border: 'border-red-400',
    reason: 'Avoid group shots. Only your face should be visible and centered.',
    color: 'text-red-700',
  },
];

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
  const { toast } = useToast();

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

      setAnalysisResult(data);
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
    handleValidatedFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleValidatedFile(e.dataTransfer.files?.[0]);
  };

  const handleModalClose = () => {
    setError(null);
    setAnalysisResult(null);
    setPreviewImage(null);
    setIsAnalyzing(false);
    onClose();
  };

  const handleTryAnother = () => {
    setError(null);
    setAnalysisResult(null);
    setPreviewImage(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Image Guidelines</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleModalClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex h-[calc(95vh-120px)]">
          {/* Left Column - Guidelines & Upload */}
          <div className="flex-1 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="space-y-6">
              {/* Guidelines */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Photo Requirements
                </h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                  <li>Use a recent, clear, and professional headshot</li>
                  <li>Face should be centered and visible (no sunglasses, hats, or heavy filters)</li>
                  <li>High resolution, well-lit, neutral background preferred</li>
                  <li>File format: JPG or PNG. Max size: 5MB</li>
                  <li>Avoid group photos, logos, or full-body shots</li>
                </ul>
              </div>

              {/* Examples Grid */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Examples</h4>
                <div className="grid grid-cols-2 gap-4">
                  {EXAMPLES.map(example => (
                    <div key={example.label} className="space-y-2">
                      <div className={`aspect-square rounded-lg overflow-hidden border-2 ${example.border} bg-gray-100`}>
                        <img 
                          src={example.src} 
                          alt={example.label + ' Example'} 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                      <div className="text-center">
                        <span className={`text-sm font-semibold ${example.color}`}>
                          {example.label}
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {example.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Area */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Upload Your Photo</h4>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                  onDrop={handleDrop}
                >
                  <input
                    id="profile-image-upload-modal"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/bmp,image/webp,image/tiff,image/svg+xml"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={uploading || isAnalyzing}
                  />
                  <label htmlFor="profile-image-upload-modal" className="block cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <span className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Click or drag and drop
                    </span>
                    <Button className="mt-2" disabled={uploading || isAnalyzing}>
                      Choose File
                    </Button>
                  </label>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">JPG or PNG, max 5MB</p>
                  {error && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Analysis */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!previewImage && !isAnalyzing && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Upload a photo to analyze
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Your image will appear here with analysis results
                  </p>
                </div>
              </div>
            )}

            {(previewImage || isAnalyzing) && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Analysis Results
                  </h3>
                  
                  {/* Image Preview */}
                  {previewImage && (
                    <div className="flex justify-center mb-6">
                      <div className="w-64 h-64 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Analysis Component */}
                  <ProfileImageAnalysisResult 
                    result={analysisResult!} 
                    isAnalyzing={isAnalyzing} 
                  />

                  {/* Action Buttons */}
                  {analysisResult && (
                    <div className="flex flex-col gap-3 pt-6">
                      <Button
                        onClick={handleProceedWithUpload}
                        disabled={uploading}
                        className="w-full"
                        size="lg"
                      >
                        {uploading ? 'Uploading...' : 'Use This Image'}
                      </Button>
                      <Button
                        onClick={handleTryAnother}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        Try Another Image
                      </Button>
                    </div>
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
