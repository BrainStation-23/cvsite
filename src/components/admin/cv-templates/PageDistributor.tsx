
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
  const measureRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [isCalculating, setIsCalculating] = useState(true);

  // Calculate required pages based on content
  useEffect(() => {
    if (!measureRef.current || !profile || sections.length === 0) {
      setPageCount(1);
      setIsCalculating(false);
      onPagesCalculated?.(1);
      return;
    }

    const calculatePages = () => {
      const container = measureRef.current;
      if (!container) return;

      // Get the height of the content without multiple pages
      const contentHeight = container.firstElementChild?.scrollHeight || 0;
      
      // A4 page height in pixels (297mm converted to pixels at 96 DPI)
      const pageHeight = 297 * 3.779528; // ~1122px
      
      // Account for margins/padding from styles
      const effectivePageHeight = pageHeight - (40 * 3.779528); // Subtract margins
      
      // Calculate required pages with a maximum limit to prevent infinite loops
      const calculatedPages = Math.max(1, Math.min(20, Math.ceil(contentHeight / effectivePageHeight)));
      
      console.log('Page calculation:', {
        contentHeight,
        pageHeight,
        effectivePageHeight,
        calculatedPages
      });

      if (calculatedPages !== pageCount) {
        setPageCount(calculatedPages);
        onPagesCalculated?.(calculatedPages);
      }
      
      setIsCalculating(false);
    };

    // Use requestAnimationFrame to ensure the DOM is ready
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(calculatePages);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [sections, profile, pageCount, onPagesCalculated]);

  const layoutType = layoutConfig.layoutType || 'single-column';

  // If still calculating, show a single page to measure content
  if (isCalculating) {
    return (
      <div ref={measureRef} style={{ visibility: 'hidden', position: 'absolute', top: '-9999px' }}>
        <CVPageRenderer
          pageNumber={1}
          totalPages={1}
          profile={profile}
          styles={styles}
          sections={sections}
          fieldMappings={fieldMappings}
          layoutType={layoutType}
        />
      </div>
    );
  }

  return (
    <div>
      {Array.from({ length: pageCount }, (_, index) => (
        <CVPageRenderer
          key={index}
          pageNumber={index + 1}
          totalPages={pageCount}
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
