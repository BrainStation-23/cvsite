
interface LayoutZone {
  id: string;
  name: string;
  description: string;
  backgroundColor?: string;
  textColor?: string;
  contrast?: boolean;
}

interface LayoutColumn {
  id: string;
  zone: string;
  widthRatio: number;
  minWidth?: string;
  maxWidth?: string;
}

export interface LayoutConfiguration {
  id: string;
  name: string;
  description: string;
  gridTemplate: string;
  columns: LayoutColumn[];
  zones: LayoutZone[];
  gap: number;
  defaultZoneStyles: Record<string, any>;
  customProperties?: Record<string, any>;
}

export interface ZoneStyleConfig {
  backgroundColor: string;
  textColor: string;
  borderRadius?: string;
  padding?: string;
  contrast: boolean;
}

export interface LayoutStyleResult {
  containerStyles: Record<string, any>;
  zoneStyles: Record<string, ZoneStyleConfig>;
  columnStyles: Record<string, Record<string, any>>;
}
