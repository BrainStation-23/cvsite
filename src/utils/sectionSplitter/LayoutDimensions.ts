
export interface LayoutDimensions {
  contentWidth: number;
  charsPerLine: number;
  techItemsPerLine: number;
  baseLineHeight: number;
}

export class LayoutDimensions {
  // Updated layout-specific dimensions with more accurate values
  private static readonly LAYOUT_DIMENSIONS = {
    'single-column': {
      contentWidth: 100, // Full width percentage
      charsPerLine: 80,
      techItemsPerLine: 6,
      baseLineHeight: 20
    },
    'two-column': {
      contentWidth: 45, // Roughly 45% width per column
      charsPerLine: 35, // Increased slightly for better accuracy
      techItemsPerLine: 2,
      baseLineHeight: 18
    },
    'sidebar': {
      main: {
        contentWidth: 65, // Main content area
        charsPerLine: 50, // Increased for better accuracy
        techItemsPerLine: 3,
        baseLineHeight: 19
      },
      sidebar: {
        contentWidth: 30, // Sidebar area
        charsPerLine: 20, // Increased slightly
        techItemsPerLine: 1,
        baseLineHeight: 16
      }
    }
  } as const;

  static getLayoutDimensions(layoutType: string, placement: 'main' | 'sidebar' = 'main'): LayoutDimensions {
    switch (layoutType) {
      case 'two-column':
        return this.LAYOUT_DIMENSIONS['two-column'];
      case 'sidebar':
        return placement === 'sidebar' 
          ? this.LAYOUT_DIMENSIONS.sidebar.sidebar 
          : this.LAYOUT_DIMENSIONS.sidebar.main;
      case 'single-column':
      default:
        return this.LAYOUT_DIMENSIONS['single-column'];
    }
  }

  static getTextWrappingMultiplier(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 1.4 : 1.2; // Reduced
      case 'two-column':
        return 1.3; // Reduced
      case 'single-column':
      default:
        return 1.0;
    }
  }

  static getSafetyMultiplier(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 1.3 : 1.2; // Reduced
      case 'two-column':
        return 1.25; // Reduced
      case 'single-column':
      default:
        return 1.15; // Reduced
    }
  }

  // Enhanced method to get rich text multiplier for HTML content
  static getRichTextMultiplier(layoutType: string, placement: 'main' | 'sidebar', hasRichContent: boolean): number {
    const baseMultiplier = this.getTextWrappingMultiplier(layoutType, placement);
    
    if (!hasRichContent) return baseMultiplier;
    
    // Additional multiplier for rich HTML content in narrow layouts
    switch (layoutType) {
      case 'sidebar':
        return baseMultiplier * (placement === 'sidebar' ? 1.3 : 1.2); // Reduced
      case 'two-column':
        return baseMultiplier * 1.25; // Reduced
      case 'single-column':
      default:
        return baseMultiplier * 1.1;
    }
  }

  // New conservative multiplier method to prevent oversized estimates
  static getConservativeRichTextMultiplier(layoutType: string, placement: 'main' | 'sidebar', hasRichContent: boolean): number {
    let baseMultiplier: number;
    
    switch (layoutType) {
      case 'sidebar':
        baseMultiplier = placement === 'sidebar' ? 1.15 : 1.1;
        break;
      case 'two-column':
        baseMultiplier = 1.1;
        break;
      case 'single-column':
      default:
        baseMultiplier = 1.0;
    }
    
    // Very minimal increase for rich content
    if (hasRichContent) {
      baseMultiplier *= 1.05;
    }
    
    return baseMultiplier;
  }
}
