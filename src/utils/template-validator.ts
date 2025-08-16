
import { CV_TEMPLATE_STANDARDS } from '@/constants/cv-template-standards';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  type: 'missing-container' | 'missing-data-section' | 'invalid-structure';
  message: string;
  line?: number;
  element?: string;
}

export interface ValidationWarning {
  type: 'missing-page-break' | 'suboptimal-structure' | 'accessibility';
  message: string;
  element?: string;
  suggestion?: string;
}

export class CVTemplateValidator {
  validate(htmlTemplate: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Parse HTML (basic parsing - in production, consider using DOMParser)
    const doc = this.parseHTML(htmlTemplate);

    // Check for required container
    if (!this.hasContainer(doc)) {
      errors.push({
        type: 'missing-container',
        message: 'Template must have a root .cv-container element',
        element: 'cv-container'
      });
    }

    // Check for data-section attributes
    const sections = this.getSections(doc);
    if (sections.length === 0) {
      errors.push({
        type: 'missing-data-section',
        message: 'Template must have at least one element with data-section attribute',
        element: 'data-section'
      });
    }

    // Check section types
    const invalidSections = sections.filter(section => 
      !CV_TEMPLATE_STANDARDS.SECTION_TYPES.includes(section)
    );
    
    if (invalidSections.length > 0) {
      warnings.push({
        type: 'suboptimal-structure',
        message: `Unknown section types found: ${invalidSections.join(', ')}`,
        suggestion: `Use standard section types: ${CV_TEMPLATE_STANDARDS.SECTION_TYPES.join(', ')}`
      });
    }

    // Check for page break classes
    if (!this.hasPageBreakClasses(doc)) {
      warnings.push({
        type: 'missing-page-break',
        message: 'No page break control classes found',
        suggestion: 'Add .cv-page-break-avoid to important sections'
      });
    }

    // Check for proper header structure
    if (!this.hasProperHeaders(doc)) {
      warnings.push({
        type: 'suboptimal-structure',
        message: 'Section headers should use .cv-section-header class',
        suggestion: 'Use .cv-section-header for main section titles'
      });
    }

    // Generate suggestions
    if (errors.length === 0) {
      suggestions.push('Template structure looks good!');
      
      if (warnings.length === 0) {
        suggestions.push('Consider adding more page break control classes for better PDF output');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private parseHTML(html: string): string {
    // Simple HTML parsing - in production, use DOMParser
    return html.toLowerCase();
  }

  private hasContainer(doc: string): boolean {
    return doc.includes('cv-container');
  }

  private getSections(doc: string): string[] {
    const sections: string[] = [];
    const sectionRegex = /data-section=["']([^"']+)["']/g;
    let match;
    
    while ((match = sectionRegex.exec(doc)) !== null) {
      sections.push(match[1]);
    }
    
    return sections;
  }

  private hasPageBreakClasses(doc: string): boolean {
    return Object.keys(CV_TEMPLATE_STANDARDS.PAGE_BREAK_CLASSES)
      .some(className => doc.includes(className));
  }

  private hasProperHeaders(doc: string): boolean {
    return doc.includes('cv-section-header') || doc.includes('cv-item-header');
  }

  // Method to get compliance score (0-100)
  getComplianceScore(result: ValidationResult): number {
    if (!result.isValid) return 0;
    
    const maxScore = 100;
    const warningPenalty = 10;
    const penalty = result.warnings.length * warningPenalty;
    
    return Math.max(0, maxScore - penalty);
  }

  // Method to generate auto-fix suggestions
  generateAutoFix(htmlTemplate: string): string {
    let fixed = htmlTemplate;

    // Auto-wrap with container if missing
    if (!this.hasContainer(fixed.toLowerCase())) {
      fixed = `<div class="cv-container">\n${fixed}\n</div>`;
    }

    // Add basic page break classes to sections
    fixed = fixed.replace(
      /<section([^>]*)class="([^"]*)"([^>]*)>/g,
      (match, before, classes, after) => {
        if (!classes.includes('cv-page-break')) {
          classes += ' cv-page-break-avoid';
        }
        return `<section${before}class="${classes.trim()}"${after}>`;
      }
    );

    return fixed;
  }
}

export const templateValidator = new CVTemplateValidator();
