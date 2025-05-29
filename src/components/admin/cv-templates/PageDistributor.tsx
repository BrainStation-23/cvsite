
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
  totalPages: number;
  onOverflow?: (overflowInfo: { requiredPages: number; overflowHeight: number }) => void;
  layoutConfig?: Record<string, any>;
}

export const PageDistributor: React.FC<PageDistributorProps> = ({
  sections,
  fieldMappings,
  profile,
  styles,
  totalPages,
  onOverflow,
  layoutConfig = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  // Calculate if content overflows
  useEffect(() => {
    if (containerRef.current && onOverflow) {
      const contentHeight = containerRef.current.scrollHeight;
      const pageHeight = 297 * 3.779528; // Convert mm to px (approximately)
      const availableHeight = pageHeight * totalPages;
      
      setMeasuredHeight(contentHeight);
      
      if (contentHeight > availableHeight) {
        const requiredPages = Math.ceil(contentHeight / pageHeight);
        const overflowHeight = contentHeight - availableHeight;
        
        onOverflow({ requiredPages, overflowHeight });
      }
    }
  }, [sections, profile, totalPages, onOverflow]);

  const layoutType = layoutConfig.layoutType || 'single-column';

  return (
    <div ref={containerRef}>
      {Array.from({ length: totalPages }, (_, index) => (
        <CVPageRenderer
          key={index}
          pageNumber={index + 1}
          totalPages={totalPages}
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
