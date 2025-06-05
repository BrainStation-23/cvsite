
export interface PageContent {
  pageNumber: number;
  sections: TemplateSection[];
  partialSections: {
    [sectionId: string]: {
      items: any[];
      startIndex: number;
      totalItems: number;
      isPartial: boolean;
      title: string;
    };
  };
}

export interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: {
    layout_placement?: 'main' | 'sidebar';
    projects_to_view?: number;
    [key: string]: any;
  };
}

export interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export interface LayoutStrategy {
  distribute(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    contentHeight: number,
    maxPages: number,
    orientation: string
  ): PageContent[];
}
