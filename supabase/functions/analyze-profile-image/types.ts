
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
  };
}

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
}

export interface ValidationConfig {
  azureApiKey: string;
  azureRegion: string;
  azureEndpoint: string;
}
