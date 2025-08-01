
export interface FieldConfig {
  field_name: string;
  display_label: string;
  default_enabled: boolean;
  default_masked: boolean;
  default_mask_value: string;
  default_order: number;
  field_type: string;
}

export interface FieldMapping {
  field_name: string;
  is_enabled: boolean;
  is_masked: boolean;
  mask_value: string;
  display_order: number;
  visibility_rules?: any;
  section_type?: string;
}
