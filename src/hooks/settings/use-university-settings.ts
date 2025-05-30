
export interface UniversityItem {
  id: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
}

// Re-export to maintain compatibility
export { UniversityItem as default };
