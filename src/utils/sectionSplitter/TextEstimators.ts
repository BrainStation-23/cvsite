
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
    
    // Calculate lines based on layout-specific chars per line
    const estimatedLines = Math.max(1, Math.ceil(plainText.length / dimensions.charsPerLine));
    
    // Account for rich text formatting
    const htmlTagCount = (text.match(/<[^>]*>/g) || []).length;
    const formatBonus = htmlTagCount * 2;
    
    // Apply layout-specific multipliers for text wrapping
    const layoutMultiplier = LayoutDimensions.getTextWrappingMultiplier(layoutType, placement);
    
    return (estimatedLines * dimensions.baseLineHeight * layoutMultiplier) + formatBonus;
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
    
    return linesNeeded * lineHeight + 10; // +10 for label
  }

  private static getTechLineHeight(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 20 : 23;
      case 'two-column':
        return 22;
      case 'single-column':
      default:
        return 25;
    }
  }
}
