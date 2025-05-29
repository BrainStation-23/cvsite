
import React, { useEffect, useRef, useState } from 'react';
import { CVPageRenderer } from './CVPageRenderer';

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

interface PageDistributorProps {
  sections: TemplateSection[];
  fieldMappings: FieldMapping[];
  profile: any;
  styles: any;
  onPagesCalculated?: (pageCount: number) => void;
  layoutConfig?: Record<string, any>;
}

export const PageDistributor: React.FC<PageDistributorProps> = ({
  sections,
  fieldMappings,
  profile,
  styles,
  onPagesCalculated,
  layoutConfig = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedPages, setCalculatedPages] = useState(1);

  // Calculate required pages based on content
  useEffect(() => {
    if (containerRef.current) {
      const contentHeight = containerRef.current.scrollHeight;
      const pageHeight = 297 * 3.779528; // Convert mm to px (approximately)
      const requiredPages = Math.max(1, Math.ceil(contentHeight / pageHeight));
      
      setCalculatedPages(requiredPages);
      onPagesCalculated?.(requiredPages);
    }
  }, [sections, profile, onPagesCalculated]);

  const layoutType = layoutConfig.layoutType || 'single-column';

  return (
    <div ref={containerRef}>
      {Array.from({ length: calculatedPages }, (_, index) => (
        <CVPageRenderer
          key={index}
          pageNumber={index + 1}
          totalPages={calculatedPages}
          profile={profile}
          styles={styles}
          sections={sections}
          fieldMappings={fieldMappings}
          layoutType={layoutType}
        />
      ))}
    </div>
  );
};
