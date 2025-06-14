
import React, { useMemo, useEffect } from 'react';
import { SectionSplitter } from '@/utils/sectionSplitter';
import { CVPageRenderer } from './CVPageRenderer';
import { LayoutStrategyFactory } from './layout-strategies/LayoutStrategyFactory';
import { PageContent, TemplateSection, FieldMapping } from './layout-strategies/LayoutStrategyInterface';

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
  const A4_CONTENT_HEIGHT = SectionSplitter.getContentHeight(orientation);
  const MAX_PAGES = 20;

  const distributedPages = useMemo((): PageContent[] => {
    if (!profile || sections.length === 0) {
      return [{
        pageNumber: 1,
        sections: [],
        partialSections: {}
      }];
    }

    console.log('IntelligentPageDistributor processing sections:', {
      layoutType: layoutConfig.layoutType,
      sectionsWithPlacement: sections.map(s => ({
        id: s.id,
        type: s.section_type,
        placement: s.styling_config?.layout_placement || 'main'
      }))
    });

    const layoutType = layoutConfig.layoutType || 'single-column';
    const strategy = LayoutStrategyFactory.createStrategy(layoutType);
    
    return strategy.distribute(
      sections,
      fieldMappings,
      profile,
      A4_CONTENT_HEIGHT,
      MAX_PAGES,
      orientation
    );
  }, [sections, profile, fieldMappings, orientation, layoutConfig]);

  // Use useEffect to call onPagesCalculated to avoid setState during render
  useEffect(() => {
    if (onPagesCalculated) {
      onPagesCalculated(distributedPages.length);
    }
  }, [distributedPages.length, onPagesCalculated]);

  const layoutType = layoutConfig.layoutType || 'single-column';

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
