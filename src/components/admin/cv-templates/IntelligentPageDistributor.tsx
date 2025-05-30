
import React from 'react';
import { CVPageRenderer } from './CVPageRenderer';
import { usePageBuilder } from './components/PageBuilder';

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
}

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

interface IntelligentPageDistributorProps {
  sections: TemplateSection[];
  fieldMappings: FieldMapping[];
  profile: any;
  styles: any;
  onPagesCalculated?: (pageCount: number) => void;
  layoutConfig?: Record<string, any>;
}

export const IntelligentPageDistributor: React.FC<IntelligentPageDistributorProps> = ({
  sections,
  fieldMappings,
  profile,
  styles,
  onPagesCalculated,
  layoutConfig = {}
}) => {
  // Get orientation from styles or default to portrait
  const orientation = styles.baseStyles?.orientation || 'portrait';
  const layoutType = layoutConfig.layoutType || 'single-column';

  const distributedPages = usePageBuilder({
    sections,
    profile,
    fieldMappings,
    orientation,
    onPagesCalculated
  });

  return (
    <div>
      {distributedPages.map((pageContent, index) => (
        <CVPageRenderer
          key={`page-${pageContent.pageNumber}`}
          pageNumber={pageContent.pageNumber}
          totalPages={distributedPages.length}
          profile={profile}
          styles={styles}
          sections={pageContent.sections}
          fieldMappings={fieldMappings}
          layoutType={layoutType}
          partialSections={pageContent.partialSections}
        />
      ))}
    </div>
  );
};
