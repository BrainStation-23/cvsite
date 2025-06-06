
export interface LayoutDimensions {
  contentWidth: number;
  charsPerLine: number;
  techItemsPerLine: number;
  baseLineHeight: number;
}

export class LayoutDimensions {
  // Layout-specific dimensions
  private static readonly LAYOUT_DIMENSIONS = {
    'single-column': {
      contentWidth: 100, // Full width percentage
      charsPerLine: 80,
      techItemsPerLine: 6,
      baseLineHeight: 20
    },
    'two-column': {
      contentWidth: 45, // Roughly 45% width per column
      charsPerLine: 45,
      techItemsPerLine: 3,
      baseLineHeight: 18
    },
    'sidebar': {
      main: {
        contentWidth: 65, // Main content area
        charsPerLine: 55,
        techItemsPerLine: 4,
        baseLineHeight: 19
      },
      sidebar: {
        contentWidth: 30, // Sidebar area
        charsPerLine: 25,
        techItemsPerLine: 2,
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
        return placement === 'sidebar' ? 1.3 : 1.1;
      case 'two-column':
        return 1.15;
      case 'single-column':
      default:
        return 1.0;
    }
  }

  static getSafetyMultiplier(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 1.4 : 1.25; // Sidebar content wraps more
      case 'two-column':
        return 1.3; // Two-column content wraps more than single
      case 'single-column':
      default:
        return 1.2;
    }
  }
}
