
import React, { useMemo, useEffect } from 'react';
import { SectionSplitter } from '@/utils/sectionSplitter';
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
        // If current page has content, finish it and start a new page
        if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
          pages.push(currentPage);
          currentPage = {
            pageNumber: pages.length + 1,
            sections: [],
            partialSections: {}
          };
          currentPageHeight = 0;
        }
        // Page break sections don't add content, they just force a page break
        continue;
      }

      // For regular sections, continue with smart content-based page breaking
      const sectionData = getSectionData(profile, section.section_type);
      const sectionTitle = getSectionTitle(section, fieldMappings);
      
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue; // Skip empty sections
      }

      // For sections that can be split (experience, projects, education, achievements)
      if (canSectionBeSplit(section.section_type) && Array.isArray(sectionData)) {
        // Apply section configuration limits BEFORE processing
        let limitedSectionData = sectionData.filter(item => item != null);
        
        // Apply projects_to_view limit for projects section
        if (section.section_type === 'projects' && section.styling_config?.projects_to_view) {
          const maxProjects = section.styling_config.projects_to_view;
          limitedSectionData = limitedSectionData.slice(0, maxProjects);
        }
        
        let remainingItems = limitedSectionData;
        let isFirstPart = true;

        while (remainingItems.length > 0 && pages.length < MAX_PAGES) {
          const availableHeight = A4_CONTENT_HEIGHT - currentPageHeight;
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
            // Add section to current page
            if (!currentPage.sections.find(s => s.id === section.id)) {
              currentPage.sections.push(section);
            }
            
            // Ensure we only include valid items (filter out any undefined values)
            const validItems = split.pageItems
              .map(item => item.content)
              .filter(item => item != null);
            
            currentPage.partialSections[section.id] = {
              items: validItems,
              startIndex: limitedSectionData.length - remainingItems.length,
              totalItems: limitedSectionData.length, // Use limited data length
              isPartial: remainingItems.length > split.pageItems.length,
              title: isFirstPart ? sectionTitle : `${sectionTitle} (continued)`
            };

            const usedHeight = split.pageItems.reduce((sum, item) => sum + item.estimatedHeight, 0) + 30; // +30 for title
            currentPageHeight += usedHeight;
            remainingItems = split.remainingItems.map(item => item.content).filter(item => item != null);
            isFirstPart = false;
          }

          // Start new page if there are remaining items
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
        // For non-splittable sections
        const estimatedHeight = SectionSplitter.estimateSectionHeight(
          section.section_type, 
          Array.isArray(sectionData) ? sectionData : [sectionData],
          orientation
        );
        
        if (currentPageHeight + estimatedHeight > A4_CONTENT_HEIGHT && currentPage.sections.length > 0) {
          // Start new page when content doesn't fit
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

    return pages;
  }, [sections, profile, fieldMappings, orientation]);

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
