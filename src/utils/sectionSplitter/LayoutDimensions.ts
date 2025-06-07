
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
      charsPerLine: 30, // Reduced further for better accuracy
      techItemsPerLine: 2, // Conservative estimate
      baseLineHeight: 18
    },
    'sidebar': {
      main: {
        contentWidth: 65, // Main content area
        charsPerLine: 45, // Reduced for better accuracy
        techItemsPerLine: 3,
        baseLineHeight: 19
      },
      sidebar: {
        contentWidth: 30, // Sidebar area
        charsPerLine: 18, // Very conservative for narrow sidebar
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
        return placement === 'sidebar' ? 1.8 : 1.3; // Increased for sidebar
      case 'two-column':
        return 1.5; // Increased for narrow columns
      case 'single-column':
      default:
        return 1.0;
    }
  }

  static getSafetyMultiplier(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 1.8 : 1.4; // Increased safety margins
      case 'two-column':
        return 1.5; // Increased for two-column
      case 'single-column':
      default:
        return 1.2;
    }
  }

  // Enhanced method to get rich text multiplier for HTML content
  static getRichTextMultiplier(layoutType: string, placement: 'main' | 'sidebar', hasRichContent: boolean): number {
    const baseMultiplier = this.getTextWrappingMultiplier(layoutType, placement);
    
    if (!hasRichContent) return baseMultiplier;
    
    // Additional multiplier for rich HTML content in narrow layouts
    switch (layoutType) {
      case 'sidebar':
        return baseMultiplier * (placement === 'sidebar' ? 1.5 : 1.3); // Increased multipliers
      case 'two-column':
        return baseMultiplier * 1.4; // Increased for two-column
      case 'single-column':
      default:
        return baseMultiplier * 1.1;
    }
  }
}
