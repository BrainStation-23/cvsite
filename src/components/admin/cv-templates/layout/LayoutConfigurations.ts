
import { LayoutConfiguration } from './LayoutTypes';

export const LAYOUT_CONFIGURATIONS: Record<string, LayoutConfiguration> = {
  'single-column': {
    id: 'single-column',
    name: 'Single Column',
    description: 'Traditional single-column layout',
    gridTemplate: '1fr',
    columns: [
      {
        id: 'main',
        zone: 'main',
        widthRatio: 1
      }
    ],
    zones: [
      {
        id: 'main',
        name: 'Main Content',
        description: 'Primary content area',
        contrast: false
      }
    ],
    gap: 0,
    defaultZoneStyles: {
      main: {
        backgroundColor: 'transparent',
        padding: '0'
      }
    }
  },

  'two-column': {
    id: 'two-column',
    name: 'Two Column',
    description: 'Balanced dual-column layout',
    gridTemplate: '1fr 1fr',
    columns: [
      {
        id: 'main',
        zone: 'main',
        widthRatio: 0.5
      },
      {
        id: 'secondary',
        zone: 'secondary',
        widthRatio: 0.5
      }
    ],
    zones: [
      {
        id: 'main',
        name: 'Main Content',
        description: 'Primary content area',
        contrast: false
      },
      {
        id: 'secondary',
        name: 'Secondary Content',
        description: 'Secondary content area',
        contrast: false
      }
    ],
    gap: 10,
    defaultZoneStyles: {
      main: {
        backgroundColor: 'transparent',
        padding: '0'
      },
      secondary: {
        backgroundColor: 'var(--accent-bg)',
        padding: '15px',
        borderRadius: '8px'
      }
    }
  },

  'sidebar': {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Sidebar layout with main content area',
    gridTemplate: '1fr 2fr',
    columns: [
      {
        id: 'sidebar',
        zone: 'sidebar',
        widthRatio: 0.33
      },
      {
        id: 'main',
        zone: 'main',
        widthRatio: 0.67
      }
    ],
    zones: [
      {
        id: 'sidebar',
        name: 'Sidebar',
        description: 'Sidebar content area',
        contrast: true
      },
      {
        id: 'main',
        name: 'Main Content',
        description: 'Primary content area',
        contrast: false
      }
    ],
    gap: 12,
    defaultZoneStyles: {
      sidebar: {
        backgroundColor: 'var(--primary-color)',
        padding: '20px 15px',
        borderRadius: '0 12px 12px 0'
      },
      main: {
        backgroundColor: 'transparent',
        padding: '0'
      }
    }
  }
};

export const getLayoutConfiguration = (layoutType: string): LayoutConfiguration => {
  return LAYOUT_CONFIGURATIONS[layoutType] || LAYOUT_CONFIGURATIONS['single-column'];
};

export const getSupportedLayouts = (): string[] => {
  return Object.keys(LAYOUT_CONFIGURATIONS);
};
