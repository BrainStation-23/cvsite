
import { useMemo } from 'react';
import { SectionSplitter } from '@/utils/sectionSplitter';
import { SectionProcessor } from './SectionProcessor';
import { PageContent } from '../utils/pageDistributionUtils';

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

interface PageBuilderProps {
  sections: TemplateSection[];
  profile: any;
  fieldMappings: FieldMapping[];
  orientation: string;
  onPagesCalculated?: (pageCount: number) => void;
}

export const usePageBuilder = ({
  sections,
  profile,
  fieldMappings,
  orientation,
  onPagesCalculated
}: PageBuilderProps): PageContent[] => {
  return useMemo((): PageContent[] => {
    if (!profile || sections.length === 0) {
      onPagesCalculated?.(1);
      return [{
        pageNumber: 1,
        sections: [],
        partialSections: {}
      }];
    }

    const A4_CONTENT_HEIGHT = SectionSplitter.getContentHeight(orientation);
    const MAX_PAGES = 20;
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    
    const pages: PageContent[] = [];
    let currentPage: PageContent = {
      pageNumber: 1,
      sections: [],
      partialSections: {}
    };
    let currentPageHeight = 0;

    const handlePageUpdate = (page: PageContent, height: number) => {
      pages.push(page);
    };

    const createNewPage = (): PageContent => {
      return {
        pageNumber: pages.length + 1,
        sections: [],
        partialSections: {}
      };
    };

    for (const section of sortedSections) {
      if (pages.length >= MAX_PAGES) break;

      const result = SectionProcessor({
        section,
        profile,
        fieldMappings,
        currentPage,
        currentPageHeight,
        contentHeight: A4_CONTENT_HEIGHT,
        orientation,
        onPageUpdate: handlePageUpdate,
        onNewPage: createNewPage
      });

      currentPage = result.currentPage;
      currentPageHeight = result.currentPageHeight;

      if (!result.shouldContinue) break;
    }

    // Add the last page if it has content
    if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
      pages.push(currentPage);
    }

    // Ensure at least one page
    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        sections: [],
        partialSections: {}
      });
    }

    onPagesCalculated?.(pages.length);
    return pages;
  }, [sections, profile, fieldMappings, orientation, onPagesCalculated]);
};
