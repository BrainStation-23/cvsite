
import { LayoutStyleFactory } from '@/components/admin/cv-templates/layout/LayoutStyleFactory';

/**
 * @deprecated This class is being replaced by the unified LayoutStyleFactory system.
 * Use HTMLLayoutRenderer.generateLayoutCSS() instead for consistent styling with the CV preview.
 */
export class HTMLCSSGenerator {
  generateCSS(layoutConfig: Record<string, any>, orientation: string): string {
    console.warn('HTMLCSSGenerator is deprecated. Use HTMLLayoutRenderer.generateLayoutCSS() instead.');
    
    // Fallback implementation for backward compatibility
    const pageWidth = orientation === 'portrait' ? '210mm' : '297mm';
    const pageHeight = orientation === 'portrait' ? '297mm' : '210mm';
    
    return `
      body {
        margin: 0;
        padding: 20px;
        font-family: ${layoutConfig.primaryFont || 'Arial'}, sans-serif;
        font-size: ${layoutConfig.baseFontSize || 12}pt;
        line-height: ${layoutConfig.lineHeight || 1.4};
        color: #333;
        background-color: #f5f5f5;
      }
      
      .cv-container {
        max-width: ${pageWidth};
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        padding: ${layoutConfig.margin || 20}mm;
      }
      
      .section {
        margin-bottom: ${layoutConfig.sectionSpacing || 16}pt;
      }
      
      .section-title {
        font-size: ${layoutConfig.subheadingSize || 14}pt;
        font-weight: bold;
        border-bottom: 1px solid ${layoutConfig.accentColor || '#3b82f6'};
        padding-bottom: 2pt;
        margin-bottom: ${layoutConfig.itemSpacing || 8}pt;
      }
    `;
  }
}
