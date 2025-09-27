export interface ValidationResult {
  id: string;
  type: string;
  passed: boolean;
  details: string;
  label: string;
  source: string;
}

export interface ValidationProgress {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  passed?: boolean;
  details?: string;
}

export interface ImageAnalysisResult {
  isProfessionalHeadshot: boolean;
  confidence: number;
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

export interface ProfileImageGuidelineModalProps {
  show: boolean;
  onClose: () => void;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  uploading: boolean;
  onValidFile: (file: File) => Promise<void>;
  profileId?: string;
}
