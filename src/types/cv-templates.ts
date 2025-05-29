export interface CVTemplate {
  id: string;
  name: string;
  description?: string;
  orientation: 'portrait' | 'landscape';
  layout_config: Record<string, any>;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CVTemplateSection {
  id: string;
  template_id: string;
  section_type: 'general' | 'skills' | 'technical_skills' | 'specialized_skills' | 'experience' | 'education' | 'training' | 'achievements' | 'projects';
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CVTemplateFieldMapping {
  id: string;
  template_id: string;
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CVExport {
  id: string;
  template_id: string;
  profile_id: string;
  export_format: 'pdf' | 'docx';
  export_url?: string;
  exported_by: string;
  exported_at: string;
}

export type CVSectionType = CVTemplateSection['section_type'];
export type CVOrientation = CVTemplate['orientation'];
export type CVExportFormat = CVExport['export_format'];
