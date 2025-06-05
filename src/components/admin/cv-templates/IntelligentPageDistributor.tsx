import React, { useMemo, useEffect } from 'react';
import { SectionSplitter } from '@/utils/sectionSplitter';
import { CVPageRenderer } from './CVPageRenderer';

interface TemplateSection {
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

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

interface PageContent {
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
    
    // Handle sidebar and two-column layouts differently
    if (layoutType === 'sidebar' || layoutType === 'two-column') {
      return distributeMultiColumnPages(sections, fieldMappings, profile, A4_CONTENT_HEIGHT, MAX_PAGES, layoutType, orientation);
    } else {
      return distributeSingleColumnPages(sections, fieldMappings, profile, A4_CONTENT_HEIGHT, MAX_PAGES, orientation);
    }
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

// New function to handle multi-column layouts (sidebar and two-column)
function distributeMultiColumnPages(
  sections: TemplateSection[],
  fieldMappings: FieldMapping[],
  profile: any,
  contentHeight: number,
  maxPages: number,
  layoutType: string,
  orientation: string
): PageContent[] {
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
  
  // Separate sections by placement
  const mainSections = sortedSections.filter(s => 
    (s.styling_config?.layout_placement || 'main') === 'main'
  );
  const sidebarSections = sortedSections.filter(s => 
    (s.styling_config?.layout_placement || 'main') === 'sidebar'
  );

  console.log('Multi-column layout distribution:', {
    layoutType,
    mainSections: mainSections.map(s => s.section_type),
    sidebarSections: sidebarSections.map(s => s.section_type)
  });

  const pages: PageContent[] = [];
  
  // Process all sections together to ensure they appear on the same pages
  const allPages = Math.max(
    getRequiredPagesForSections(mainSections, fieldMappings, profile, contentHeight, orientation),
    getRequiredPagesForSections(sidebarSections, fieldMappings, profile, contentHeight, orientation)
  );

  // Create pages and distribute sections
  for (let pageIndex = 0; pageIndex < Math.min(allPages, maxPages); pageIndex++) {
    const currentPage: PageContent = {
      pageNumber: pageIndex + 1,
      sections: [],
      partialSections: {}
    };

    // Add main sections for this page
    const mainSectionsForPage = getPageSections(mainSections, fieldMappings, profile, contentHeight, pageIndex, orientation);
    currentPage.sections.push(...mainSectionsForPage.sections);
    Object.assign(currentPage.partialSections, mainSectionsForPage.partialSections);

    // Add sidebar sections for this page
    const sidebarSectionsForPage = getPageSections(sidebarSections, fieldMappings, profile, contentHeight, pageIndex, orientation);
    currentPage.sections.push(...sidebarSectionsForPage.sections);
    Object.assign(currentPage.partialSections, sidebarSectionsForPage.partialSections);

    if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
      pages.push(currentPage);
    }
  }

  // Ensure at least one page
  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      sections: [],
      partialSections: {}
    });
  }

  return pages;
}

// Helper function to calculate required pages for a set of sections
function getRequiredPagesForSections(
  sections: TemplateSection[],
  fieldMappings: FieldMapping[],
  profile: any,
  contentHeight: number,
  orientation: string
): number {
  let totalHeight = 0;
  let pages = 1;

  for (const section of sections) {
    if (section.section_type === 'page_break') {
      pages++;
      totalHeight = 0;
      continue;
    }

    const sectionData = getSectionData(profile, section.section_type);
    if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
      continue;
    }

    const estimatedHeight = SectionSplitter.estimateSectionHeight(
      section.section_type, 
      Array.isArray(sectionData) ? sectionData : [sectionData],
      orientation
    );

    if (totalHeight + estimatedHeight > contentHeight) {
      pages++;
      totalHeight = estimatedHeight;
    } else {
      totalHeight += estimatedHeight;
    }
  }

  return pages;
}

// Helper function to get sections for a specific page
function getPageSections(
  sections: TemplateSection[],
  fieldMappings: FieldMapping[],
  profile: any,
  contentHeight: number,
  pageIndex: number,
  orientation: string
): { sections: TemplateSection[], partialSections: any } {
  const result = {
    sections: [] as TemplateSection[],
    partialSections: {} as any
  };

  let currentPageIndex = 0;
  let currentPageHeight = 0;

  for (const section of sections) {
    // Handle page break sections
    if (section.section_type === 'page_break') {
      if (currentPageIndex === pageIndex) {
        // We've reached the target page and hit a page break, so we're done
        break;
      }
      currentPageIndex++;
      currentPageHeight = 0;
      continue;
    }

    const sectionData = getSectionData(profile, section.section_type);
    if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
      continue;
    }

    const estimatedHeight = SectionSplitter.estimateSectionHeight(
      section.section_type, 
      Array.isArray(sectionData) ? sectionData : [sectionData],
      orientation
    );

    // Check if this section fits on the current page
    if (currentPageHeight + estimatedHeight > contentHeight && currentPageHeight > 0) {
      currentPageIndex++;
      currentPageHeight = estimatedHeight;
    } else {
      currentPageHeight += estimatedHeight;
    }

    // If we're on the target page, add this section
    if (currentPageIndex === pageIndex) {
      result.sections.push(section);
    }
  }

  return result;
}

// Keep the original single-column distribution logic
function distributeSingleColumnPages(
  sections: TemplateSection[],
  fieldMappings: FieldMapping[],
  profile: any,
  contentHeight: number,
  maxPages: number,
  orientation: string
): PageContent[] {
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
  const pages: PageContent[] = [];
  let currentPage: PageContent = {
    pageNumber: 1,
    sections: [],
    partialSections: {}
  };
  let currentPageHeight = 0;

  for (const section of sortedSections) {
    // Handle page break sections - force a new page immediately
    if (section.section_type === 'page_break') {
      if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
        pages.push(currentPage);
        currentPage = {
          pageNumber: pages.length + 1,
          sections: [],
          partialSections: {}
        };
        currentPageHeight = 0;
      }
      continue;
    }

    const sectionData = getSectionData(profile, section.section_type);
    const sectionTitle = getSectionTitle(section, fieldMappings);
    
    if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
      continue;
    }

    if (canSectionBeSplit(section.section_type) && Array.isArray(sectionData)) {
      // Handle splittable sections
      let limitedSectionData = sectionData.filter(item => item != null);
      
      if (section.section_type === 'projects' && section.styling_config?.projects_to_view) {
        const maxProjects = section.styling_config.projects_to_view;
        limitedSectionData = limitedSectionData.slice(0, maxProjects);
      }
      
      let remainingItems = limitedSectionData;
      let isFirstPart = true;

      while (remainingItems.length > 0 && pages.length < maxPages) {
        const availableHeight = contentHeight - currentPageHeight;
        let split;

        switch (section.section_type) {
          case 'experience':
            split = SectionSplitter.splitExperienceSection(remainingItems, availableHeight, sectionTitle);
            break;
          case 'projects':
            split = SectionSplitter.splitProjectsSection(remainingItems, availableHeight, sectionTitle);
            break;
          case 'education':
            split = SectionSplitter.splitEducationSection(remainingItems, availableHeight, sectionTitle);
            break;
          case 'achievements':
            split = SectionSplitter.splitAchievementsSection(remainingItems, availableHeight, sectionTitle);
            break;
          default:
            split = { pageItems: remainingItems, remainingItems: [], sectionTitle };
        }

        if (split.pageItems.length > 0) {
          if (!currentPage.sections.find(s => s.id === section.id)) {
            currentPage.sections.push(section);
          }
          
          const validItems = split.pageItems
            .map(item => item.content)
            .filter(item => item != null);
          
          currentPage.partialSections[section.id] = {
            items: validItems,
            startIndex: limitedSectionData.length - remainingItems.length,
            totalItems: limitedSectionData.length,
            isPartial: remainingItems.length > split.pageItems.length,
            title: isFirstPart ? sectionTitle : `${sectionTitle} (continued)`
          };

          const usedHeight = split.pageItems.reduce((sum, item) => sum + item.estimatedHeight, 0) + 30;
          currentPageHeight += usedHeight;
          remainingItems = split.remainingItems.map(item => item.content).filter(item => item != null);
          isFirstPart = false;
        }

        if (remainingItems.length > 0) {
          pages.push(currentPage);
          currentPage = {
            pageNumber: pages.length + 1,
            sections: [],
            partialSections: {}
          };
          currentPageHeight = 0;
        }
      }
    } else {
      // Handle non-splittable sections
      const estimatedHeight = SectionSplitter.estimateSectionHeight(
        section.section_type, 
        Array.isArray(sectionData) ? sectionData : [sectionData],
        orientation
      );
      
      if (currentPageHeight + estimatedHeight > contentHeight && currentPage.sections.length > 0) {
        pages.push(currentPage);
        currentPage = {
          pageNumber: pages.length + 1,
          sections: [],
          partialSections: {}
        };
        currentPageHeight = 0;
      }

      currentPage.sections.push(section);
      currentPageHeight += estimatedHeight;
    }
  }

  if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
    pages.push(currentPage);
  }

  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      sections: [],
      partialSections: {}
    });
  }

  return pages;
}

// Helper functions
function getSectionData(profile: any, sectionType: string): any {
  switch (sectionType) {
    case 'general':
      return profile;
    case 'experience':
      return profile.experiences || [];
    case 'education':
      return profile.education || [];
    case 'projects':
      return profile.projects || [];
    case 'technical_skills':
      return profile.technical_skills || [];
    case 'specialized_skills':
      return profile.specialized_skills || [];
    case 'training':
      return profile.trainings || [];
    case 'achievements':
      return profile.achievements || [];
    default:
      return null;
  }
}

function getSectionTitle(section: TemplateSection, fieldMappings: FieldMapping[]): string {
  const titleMapping = fieldMappings.find(
    mapping => mapping.original_field_name === 'section_title' && mapping.section_type === section.section_type
  );
  
  const defaultTitles = {
    general: 'General Information',
    experience: 'Work Experience',
    education: 'Education',
    projects: 'Projects',
    technical_skills: 'Technical Skills',
    specialized_skills: 'Specialized Skills',
    training: 'Training & Certifications',
    achievements: 'Achievements'
  };

  return titleMapping?.display_name || defaultTitles[section.section_type as keyof typeof defaultTitles] || section.section_type;
}

function canSectionBeSplit(sectionType: string): boolean {
  return ['experience', 'projects', 'education', 'training', 'achievements'].includes(sectionType);
}
