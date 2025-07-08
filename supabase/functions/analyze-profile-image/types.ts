
export interface AzureFaceDetectionResponse {
  faceId: string;
  faceRectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  faceAttributes: {
    accessories?: Array<{
      type: string;
      confidence: number;
    }>;
    glasses?: string;
    headPose?: {
      pitch: number;
      roll: number;
      yaw: number;
    };
    emotion?: {
      anger: number;
      contempt: number;
      disgust: number;
      fear: number;
      happiness: number;
      neutral: number;
      sadness: number;
      surprise: number;
    };
    smile?: number;
  };
}

export interface ImageAnalysisResult {
  isProfessionalHeadshot: boolean;
  isFaceCentered: boolean;
  hasNoSunglassesOrHats: boolean;
  isNotGroupPhoto: boolean;
  hasAppropriateExpression: boolean;
  confidence: number;
  details: {
    faceCount: number;
    glasses: string;
    accessories: string[];
    facePosition: string;
    expression: string;
    recommendations: string[];
  };
}

export interface ValidationConfig {
  azureApiKey: string;
  azureRegion: string;
  azureEndpoint: string;
}
