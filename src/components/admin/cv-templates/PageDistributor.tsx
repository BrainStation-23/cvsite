
import React, { useState, useEffect } from 'react';
import { ContentMeasurer } from './ContentMeasurer';
import { DynamicSectionRenderer } from './DynamicSectionRenderer';

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
}

interface MeasuredSection {
  section: TemplateSection;
  height: number;
  content: React.ReactNode;
}

export const PageDistributor: React.FC<PageDistributorProps> = ({
  sections,
  fieldMappings,
  profile,
  styles,
  totalPages,
  onOverflow
}) => {
  const [measuredSections, setMeasuredSections] = useState<MeasuredSection[]>([]);
  const [pageDistribution, setPageDistribution] = useState<MeasuredSection[][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate available content height per page (A4 height minus margins and padding)
  const pageHeight = 297; // A4 height in mm
  const layoutConfig = styles.baseStyles;
  const marginTop = parseFloat(layoutConfig.padding?.split(' ')[0] || '20mm') || 20;
  const marginBottom = parseFloat(layoutConfig.padding?.split(' ')[2] || '20mm') || 20;
  const availableHeightMm = pageHeight - marginTop - marginBottom;
  const availableHeightPx = (availableHeightMm * 96) / 25.4; // Convert mm to px (96 DPI)

  const handleSectionMeasured = (sectionId: string, height: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const content = (
      <DynamicSectionRenderer
        sections={[section]}
        fieldMappings={fieldMappings}
        profile={profile}
        styles={styles}
      />
    );

    setMeasuredSections(prev => {
      const existing = prev.find(ms => ms.section.id === sectionId);
      if (existing) return prev;
      
      const newMeasured = [...prev, { section, height, content }];
      
      // Check if all sections are measured
      if (newMeasured.length === sections.length) {
        distributeSections(newMeasured);
      }
      
      return newMeasured;
    });
  };

  const distributeSections = (measured: MeasuredSection[]) => {
    // Sort sections by display order
    const sortedSections = [...measured].sort((a, b) => 
      a.section.display_order - b.section.display_order
    );

    const pages: MeasuredSection[][] = [];
    let currentPage: MeasuredSection[] = [];
    let currentPageHeight = 0;
    let totalContentHeight = 0;

    for (const measuredSection of sortedSections) {
      totalContentHeight += measuredSection.height;
      
      // Check if section fits in current page
      if (currentPageHeight + measuredSection.height <= availableHeightPx) {
        currentPage.push(measuredSection);
        currentPageHeight += measuredSection.height;
      } else {
        // Start new page if current page has content
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          currentPageHeight = 0;
        }
        
        // If section is too large for a single page, we'll still add it
        // and let the overflow handler deal with it
        currentPage.push(measuredSection);
        currentPageHeight = measuredSection.height;
      }
    }

    // Add the last page if it has content
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // Check for overflow
    const requiredPages = pages.length;
    const totalAvailableHeight = availableHeightPx * totalPages;
    
    if (totalContentHeight > totalAvailableHeight) {
      const overflowHeight = totalContentHeight - totalAvailableHeight;
      const suggestedPages = Math.ceil(totalContentHeight / availableHeightPx);
      
      onOverflow?.({
        requiredPages: suggestedPages,
        overflowHeight: overflowHeight
      });
    }

    // Pad pages array to match totalPages
    while (pages.length < totalPages) {
      pages.push([]);
    }

    setPageDistribution(pages);
    setIsLoading(false);
  };

  // Reset when dependencies change
  useEffect(() => {
    setMeasuredSections([]);
    setPageDistribution([]);
    setIsLoading(true);
  }, [sections, fieldMappings, profile, totalPages]);

  if (isLoading) {
    return (
      <div>
        {/* Hidden measurement containers */}
        {sections.map(section => (
          <ContentMeasurer
            key={section.id}
            onMeasured={(height) => handleSectionMeasured(section.id, height)}
          >
            <DynamicSectionRenderer
              sections={[section]}
              fieldMappings={fieldMappings}
              profile={profile}
              styles={styles}
            />
          </ContentMeasurer>
        ))}
        
        {/* Loading indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontFamily: 'Arial, sans-serif'
        }}>
          Optimizing page layout...
        </div>
      </div>
    );
  }

  return (
    <>
      {pageDistribution.map((pageSections, pageIndex) => (
        <div key={pageIndex + 1} style={styles.baseStyles}>
          {pageSections.map((measuredSection, sectionIndex) => (
            <div key={`${pageIndex}-${sectionIndex}`}>
              {measuredSection.content}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
