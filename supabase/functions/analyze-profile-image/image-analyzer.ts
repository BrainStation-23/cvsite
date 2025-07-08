
import { AzureFaceDetectionResponse, ImageAnalysisResult } from './types.ts';
import { GroupPhotoValidator } from './validators/group-photo-validator.ts';
import { AccessoriesValidator } from './validators/accessories-validator.ts';
import { HeadPoseValidator } from './validators/head-pose-validator.ts';
import { FaceCenteringValidator } from './validators/face-centering-validator.ts';
import { ExpressionValidator } from './validators/expression-validator.ts';

export class ImageAnalyzer {
  private groupPhotoValidator: GroupPhotoValidator;
  private accessoriesValidator: AccessoriesValidator;
  private headPoseValidator: HeadPoseValidator;
  private faceCenteringValidator: FaceCenteringValidator;
  private expressionValidator: ExpressionValidator;

  constructor() {
    this.groupPhotoValidator = new GroupPhotoValidator();
    this.accessoriesValidator = new AccessoriesValidator();
    this.headPoseValidator = new HeadPoseValidator();
    this.faceCenteringValidator = new FaceCenteringValidator();
    this.expressionValidator = new ExpressionValidator();
  }

  analyzeImage(faces: AzureFaceDetectionResponse[]): ImageAnalysisResult {
    const recommendations: string[] = [];
    
    // Validate group photo
    const groupValidation = this.groupPhotoValidator.validate(faces);
    recommendations.push(...groupValidation.recommendations);
    
    if (!groupValidation.isValid) {
      return this.createFailedResult(groupValidation, recommendations);
    }

    const face = faces[0];
    
    // Validate accessories
    const accessoriesValidation = this.accessoriesValidator.validate(face);
    recommendations.push(...accessoriesValidation.recommendations);
    
    // Validate head pose
    const headPoseValidation = this.headPoseValidator.validate(face);
    recommendations.push(...headPoseValidation.recommendations);
    
    // Validate face centering
    const centeringValidation = this.faceCenteringValidator.validate(face);
    recommendations.push(...centeringValidation.recommendations);

    // Validate expression
    const expressionValidation = this.expressionValidator.validate(face);
    recommendations.push(...expressionValidation.recommendations);

    // Determine if it's a professional headshot
    const isProfessionalHeadshot = 
      groupValidation.isValid && 
      centeringValidation.isValid && 
      accessoriesValidation.isValid && 
      headPoseValidation.isValid &&
      expressionValidation.isValid;

    // Calculate confidence score
    let confidence = 0;
    if (groupValidation.isValid) confidence += 20;
    if (centeringValidation.isValid) confidence += 20;
    if (accessoriesValidation.isValid) confidence += 20;
    if (headPoseValidation.isValid) confidence += 20;
    if (expressionValidation.isValid) confidence += 20;

    // Add positive feedback
    if (isProfessionalHeadshot) {
      recommendations.push('Excellent! This looks like a professional headshot.');
    } else if (recommendations.length === 0) {
      recommendations.push('Good photo! Minor adjustments could make it even more professional.');
    }

    return {
      isProfessionalHeadshot,
      isFaceCentered: centeringValidation.isValid,
      hasNoSunglassesOrHats: accessoriesValidation.isValid,
      isNotGroupPhoto: groupValidation.isValid,
      hasAppropriateExpression: expressionValidation.isValid,
      confidence,
      details: {
        faceCount: groupValidation.faceCount,
        glasses: accessoriesValidation.glasses,
        accessories: accessoriesValidation.accessories,
        facePosition: centeringValidation.position,
        expression: expressionValidation.expression,
        recommendations
      }
    };
  }

  private createFailedResult(
    groupValidation: { isValid: boolean; faceCount: number },
    recommendations: string[]
  ): ImageAnalysisResult {
    return {
      isProfessionalHeadshot: false,
      isFaceCentered: false,
      hasNoSunglassesOrHats: false,
      isNotGroupPhoto: groupValidation.isValid,
      hasAppropriateExpression: false,
      confidence: 0,
      details: {
        faceCount: groupValidation.faceCount,
        glasses: 'unknown',
        accessories: [],
        facePosition: 'unknown',
        expression: 'unknown',
        recommendations
      }
    };
  }
}
