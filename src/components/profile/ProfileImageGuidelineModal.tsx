
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileImageAnalysisResult from './ProfileImageAnalysisResult';

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

  // Validate file size before upload
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

      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('analyze-profile-image', {
        body: { imageBase64: base64 }
      });

      if (error) {
        throw new Error(error.message);
      }

      setAnalysisResult(data);
      
      // Show preview of the image
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
    
    // Analyze the image first
    await analyzeImage(file);
  };

  const handleProceedWithUpload = async () => {
    if (!previewImage) return;
    
    try {
      // Convert base64 back to file for upload
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          onClick={handleModalClose}
          aria-label="Close"
        >
          &times;
        </button>
        
        <h4 className="font-semibold text-blue-700 mb-4 text-lg">Profile Image Guidelines</h4>
        
        {!analysisResult && !isAnalyzing && (
          <>
            <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1 mb-6">
              <li>Use a recent, clear, and professional headshot.</li>
              <li>Face should be centered and visible (no sunglasses, hats, or heavy filters).</li>
              <li>High resolution, well-lit, neutral background preferred.</li>
              <li>File format: JPG or PNG. Max size: 5MB.</li>
              <li>Avoid group photos, logos, or full-body shots.</li>
            </ul>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {EXAMPLES.map(example => (
                <div key={example.label} className="flex flex-col items-center">
                  <div className={`w-32 h-32 rounded-lg overflow-hidden border-2 ${example.border} bg-gray-100 flex items-center justify-center`}>
                    <img src={example.src} alt={example.label + ' Example'} className="object-cover w-full h-full" />
                  </div>
                  <span className={`text-sm font-semibold mt-2 ${example.color}`}>{example.label}</span>
                  <span className="text-xs text-gray-700 dark:text-gray-200 text-center mt-1">{example.reason}</span>
                </div>
              ))}
            </div>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 dark:bg-gray-800'}`}
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
                <span className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Click or drag and drop an image here to analyze
                </span>
                <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors text-sm">
                  Choose File
                </span>
              </label>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">JPG or PNG, max 5MB</p>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </>
        )}

        {/* Preview and Analysis Section */}
        {(isAnalyzing || analysisResult) && (
          <div className="space-y-6">
            {previewImage && (
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}

            <ProfileImageAnalysisResult 
              result={analysisResult!} 
              isAnalyzing={isAnalyzing} 
            />

            {analysisResult && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleTryAnother}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Try Another Image
                </button>
                <button
                  onClick={handleProceedWithUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Use This Image'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageGuidelineModal;
