
import { LayoutDimensions } from './LayoutDimensions';

export class TextEstimators {
  static estimateRichTextHeight(
    text: string, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    if (!text) return 0;
    
    const dimensions = LayoutDimensions.getLayoutDimensions(layoutType, placement);
    const plainText = text.replace(/<[^>]*>/g, '');
    
    // Detect if this is rich HTML content
    const hasRichContent = this.hasRichHTMLContent(text);
    
    // Calculate lines based on layout-specific chars per line
    const estimatedLines = Math.max(1, Math.ceil(plainText.length / dimensions.charsPerLine));
    
    // Account for rich text formatting
    const htmlTagCount = (text.match(/<[^>]*>/g) || []).length;
    const formatBonus = htmlTagCount * 1; // Reduced from 2
    
    // Apply layout-specific multipliers for text wrapping and rich content
    const layoutMultiplier = LayoutDimensions.getConservativeRichTextMultiplier(layoutType, placement, hasRichContent);
    
    const estimatedHeight = Math.round((estimatedLines * dimensions.baseLineHeight * layoutMultiplier) + formatBonus);
    
    console.log(`Rich text height estimation (${layoutType}/${placement}): 
      - Plain text length: ${plainText.length}
      - Chars per line: ${dimensions.charsPerLine}
      - Estimated lines: ${estimatedLines}
      - Has rich content: ${hasRichContent}
      - Layout multiplier: ${layoutMultiplier}
      - Final height: ${estimatedHeight}`);
    
    return estimatedHeight;
  }

  static estimateProjectItemHeight(
    project: any,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    let totalHeight = 0;
    
    // Project name (title)
    if (project.name) {
      totalHeight += 25; // Bold title height
    }
    
    // Role and date range (subtitle)
    if (project.role || project.start_date) {
      totalHeight += 20; // Subtitle height
    }
    
    // Description (rich text)
    if (project.description) {
      totalHeight += this.estimateRichTextHeight(project.description, layoutType, placement);
    }
    
    // Responsibility (rich text) - reuse same logic as description
    if (project.responsibility) {
      totalHeight += this.estimateRichTextHeight(project.responsibility, layoutType, placement);
    }
    
    // Technologies
    if (project.technologies_used && project.technologies_used.length > 0) {
      totalHeight += this.estimateTechnologiesHeight(project.technologies_used, layoutType, placement);
    }
    
    // URL
    if (project.url) {
      totalHeight += 20;
    }
    
    // Bottom margin
    totalHeight += 16;
    
    return Math.round(totalHeight);
  }

  static estimateTechnologiesHeight(
    technologies: string[], 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    if (!technologies || technologies.length === 0) return 0;
    
    const dimensions = LayoutDimensions.getLayoutDimensions(layoutType, placement);
    
    // Calculate lines needed based on layout-specific items per line
    const linesNeeded = Math.ceil(technologies.length / dimensions.techItemsPerLine);
    const lineHeight = this.getTechLineHeight(layoutType, placement);
    
    return Math.round(linesNeeded * lineHeight + 8); // Reduced from +10
  }

  private static getTechLineHeight(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 18 : 20; // Reduced
      case 'two-column':
        return 20; // Reduced from 22
      case 'single-column':
      default:
        return 22; // Reduced from 25
    }
  }

  private static hasRichHTMLContent(text: string): boolean {
    if (!text) return false;
    
    // Check for common rich text elements
    const richTextPatterns = [
      /<(ul|ol|li)>/i,
      /<(p|div)>/i,
      /<(strong|b|em|i)>/i,
      /<br\s*\/?>/i
    ];
    
    return richTextPatterns.some(pattern => pattern.test(text));
  }
}
