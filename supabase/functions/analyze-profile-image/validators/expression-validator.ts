
import { AzureFaceDetectionResponse } from '../types.ts';

export class ExpressionValidator {
  validate(face: AzureFaceDetectionResponse): {
    isValid: boolean;
    expression: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const attributes = face.faceAttributes;
    
    let hasAppropriateExpression = true;
    let expressionDescription = 'unknown';
    
    if (attributes?.emotion && attributes?.smile !== undefined) {
      const emotion = attributes.emotion;
      const smileIntensity = attributes.smile;
      
      // Check for neutral and confident expression with soft smile
      const neutralScore = emotion.neutral;
      const happinessScore = emotion.happiness;
      const angerScore = emotion.anger;
      const sadnessScore = emotion.sadness;
      const fearScore = emotion.fear;
      
      // Ideal expression: high neutral (0.4-0.8), moderate happiness (0.1-0.4), low negative emotions
      // Smile intensity should be moderate (0.2-0.6)
      
      if (neutralScore < 0.3) {
        hasAppropriateExpression = false;
        if (angerScore > 0.3) {
          expressionDescription = 'too serious/angry';
          recommendations.push('Try to relax your facial expression and appear more approachable.');
        } else if (sadnessScore > 0.3) {
          expressionDescription = 'too sad';
          recommendations.push('Try to appear more confident and positive.');
        } else if (fearScore > 0.3) {
          expressionDescription = 'too tense';
          recommendations.push('Relax and appear more confident.');
        } else if (happinessScore > 0.6) {
          expressionDescription = 'too cheerful';
          recommendations.push('Tone down your smile slightly for a more professional look.');
        }
      } else if (smileIntensity < 0.15) {
        hasAppropriateExpression = false;
        expressionDescription = 'too serious';
        recommendations.push('Add a subtle, confident smile to appear more approachable.');
      } else if (smileIntensity > 0.7) {
        hasAppropriateExpression = false;
        expressionDescription = 'smile too intense';
        recommendations.push('Use a softer, more subtle smile for a professional headshot.');
      } else {
        expressionDescription = 'neutral and confident';
      }
      
      // Additional check for overly negative expressions
      if (angerScore > 0.2 || sadnessScore > 0.2 || fearScore > 0.2) {
        hasAppropriateExpression = false;
        expressionDescription = 'negative expression detected';
        recommendations.push('Try to appear more positive and confident.');
      }
    } else {
      recommendations.push('Unable to analyze facial expression. Ensure your face is clearly visible.');
    }

    return { 
      isValid: hasAppropriateExpression, 
      expression: expressionDescription,
      recommendations 
    };
  }
}
