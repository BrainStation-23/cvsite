
import * as faceapi from 'face-api.js';

// Load face-api.js models (call this once when the app initializes)
export const loadFaceApiModels = async () => {
  const modelUrl = '/models'; // You'll need to add face-api.js models to public/models
  
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
    faceapi.nets.faceExpressionNet.loadFromUri(modelUrl),
  ]);
};

export interface ExpressionValidationResult {
  isValid: boolean;
  confidence: number;
  detectedExpressions: { [key: string]: number };
  feedback: string;
  recommendations: string[];
}

export const validateFacialExpression = async (
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<ExpressionValidationResult> => {
  try {
    // Detect face and expressions
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detection) {
      return {
        isValid: false,
        confidence: 0,
        detectedExpressions: {},
        feedback: 'No face detected in the image',
        recommendations: ['Ensure your face is clearly visible and well-lit']
      };
    }

    const expressions = detection.expressions;
    const recommendations: string[] = [];

    // Check for neutral and confident expression with soft smile
    const neutralScore = expressions.neutral;
    const happyScore = expressions.happy;
    const sadScore = expressions.sad;
    const angryScore = expressions.angry;
    const surprisedScore = expressions.surprised;
    const fearfulScore = expressions.fearful;
    const disgustedScore = expressions.disgusted;

    // Ideal expression: High neutral (0.4-0.7), moderate happy (0.2-0.4), low other emotions
    let isValid = true;
    let confidence = 0;
    let feedback = '';

    // Check if expression is too serious (high neutral, very low happy)
    if (neutralScore > 0.7 && happyScore < 0.1) {
      isValid = false;
      feedback = 'Expression appears too serious';
      recommendations.push('Try a gentle, soft smile to appear more approachable');
    }
    // Check if expression is too cheerful (very high happy)
    else if (happyScore > 0.6) {
      isValid = false;
      feedback = 'Expression appears too cheerful';
      recommendations.push('Tone down the smile to a more subtle, professional expression');
    }
    // Check for negative emotions
    else if (sadScore > 0.3 || angryScore > 0.3 || fearfulScore > 0.3) {
      isValid = false;
      feedback = 'Expression shows negative emotions';
      recommendations.push('Relax your facial muscles and try a calm, neutral expression');
    }
    // Check for surprise (unprofessional)
    else if (surprisedScore > 0.4) {
      isValid = false;
      feedback = 'Expression appears surprised';
      recommendations.push('Maintain a calm, composed facial expression');
    }
    // Check for disgust
    else if (disgustedScore > 0.3) {
      isValid = false;
      feedback = 'Expression appears displeased';
      recommendations.push('Relax your facial expression and aim for a neutral, pleasant look');
    }
    // Ideal range: balanced neutral with soft smile
    else if (neutralScore >= 0.4 && neutralScore <= 0.7 && happyScore >= 0.15 && happyScore <= 0.4) {
      isValid = true;
      feedback = 'Expression looks professional and approachable';
      confidence = Math.min((neutralScore + happyScore) * 0.8, 1.0);
    }
    // Acceptable but not ideal
    else {
      isValid = true;
      feedback = 'Expression is acceptable but could be improved';
      confidence = 0.6;
      recommendations.push('Try to maintain a calm, confident expression with a subtle smile');
    }

    // Calculate overall confidence based on how close to ideal the expression is
    if (isValid && confidence === 0) {
      confidence = Math.max(0.5, 1.0 - Math.abs(neutralScore - 0.55) - Math.abs(happyScore - 0.25));
    }

    return {
      isValid,
      confidence: Math.round(confidence * 100) / 100,
      detectedExpressions: {
        neutral: Math.round(neutralScore * 100) / 100,
        happy: Math.round(happyScore * 100) / 100,
        sad: Math.round(sadScore * 100) / 100,
        angry: Math.round(angryScore * 100) / 100,
        surprised: Math.round(surprisedScore * 100) / 100,
        fearful: Math.round(fearfulScore * 100) / 100,
        disgusted: Math.round(disgustedScore * 100) / 100,
      },
      feedback,
      recommendations
    };

  } catch (error) {
    console.error('Error validating facial expression:', error);
    return {
      isValid: false,
      confidence: 0,
      detectedExpressions: {},
      feedback: 'Failed to analyze facial expression',
      recommendations: ['Please try again with a clearer image']
    };
  }
};

// Helper function to convert File to Image element
export const fileToImageElement = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};
