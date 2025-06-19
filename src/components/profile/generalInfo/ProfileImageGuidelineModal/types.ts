
export interface ImageAnalysisResult {
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
}

export type ValidationResult = {
  id: string;
  label: string;
  passed: boolean;
  details?: string;
  source: 'local' | 'azure';
};

export interface ValidationProgress {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  passed?: boolean;
  details?: string;
}

export interface ProfileImageGuidelineModalProps {
  show: boolean;
  onClose: () => void;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  uploading: boolean;
  onValidFile: (file: File) => Promise<void>;
}
