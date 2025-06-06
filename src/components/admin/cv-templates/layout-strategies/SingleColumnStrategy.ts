import { SectionSplitter } from '@/utils/sectionSplitter';
import { LayoutStrategy, PageContent, TemplateSection, FieldMapping } from './LayoutStrategyInterface';
import { SectionDataUtils } from '../utils/SectionDataUtils';
import { PageUtils } from '../utils/PageUtils';

export class SingleColumnStrategy implements LayoutStrategy {
  distribute(
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

    console.log(`=== SINGLE COLUMN DISTRIBUTION ===`);
    console.log(`Content height: ${contentHeight}, Max pages: ${maxPages}`);

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

      const sectionData = SectionDataUtils.getSectionData(profile, section.section_type);
      const sectionTitle = PageUtils.getSectionTitle(section, fieldMappings);
      
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      console.log(`Processing section: ${section.section_type}, current page height: ${currentPageHeight}`);

      if (PageUtils.canSectionBeSplit(section.section_type) && Array.isArray(sectionData)) {
        const result = this.handleSplittableSection(
          section, sectionData, sectionTitle, currentPage, pages, 
          currentPageHeight, contentHeight, maxPages, fieldMappings
        );
        currentPageHeight = result.newPageHeight;
        currentPage = result.currentPage;
      } else {
        const result = this.handleNonSplittableSection(
          section, sectionData, currentPage, pages, 
          currentPageHeight, contentHeight, orientation
        );
        currentPageHeight = result.newPageHeight;
        currentPage = result.currentPage;
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

    console.log(`=== DISTRIBUTION COMPLETE ===`);
    console.log(`Total pages created: ${pages.length}`);

    return pages;
  }

  private handleSplittableSection(
    section: TemplateSection,
    sectionData: any[],
    sectionTitle: string,
    currentPage: PageContent,
    pages: PageContent[],
    currentPageHeight: number,
    contentHeight: number,
    maxPages: number,
    fieldMappings: FieldMapping[]
  ): { currentPage: PageContent; newPageHeight: number } {
    let limitedSectionData = sectionData.filter(item => item != null);
    
    if (section.section_type === 'projects' && section.styling_config?.projects_to_view) {
      const maxProjects = section.styling_config.projects_to_view;
      limitedSectionData = limitedSectionData.slice(0, maxProjects);
    }
    
    let remainingItems = limitedSectionData;
    let isFirstPart = true;
    let newPageHeight = currentPageHeight;
    let updatedCurrentPage = currentPage;

    console.log(`Splitting ${section.section_type} section with ${limitedSectionData.length} items`);

    while (remainingItems.length > 0 && pages.length < maxPages) {
      const availableHeight = contentHeight - newPageHeight;
      console.log(`Available height for splitting: ${availableHeight}`);
      
      const split = this.splitSection(section, remainingItems, availableHeight, sectionTitle);

      console.log(`Split result: ${split.pageItems.length} items fit, ${split.remainingItems.length} remaining`);

      if (split.pageItems.length > 0) {
        if (!updatedCurrentPage.sections.find(s => s.id === section.id)) {
          updatedCurrentPage.sections.push(section);
        }
        
        const validItems = split.pageItems
          .map(item => item.content)
          .filter(item => item != null);
        
        updatedCurrentPage.partialSections[section.id] = {
          items: validItems,
          startIndex: limitedSectionData.length - remainingItems.length,
          totalItems: limitedSectionData.length,
          isPartial: remainingItems.length > split.pageItems.length,
          title: isFirstPart ? sectionTitle : `${sectionTitle} (continued)`
        };

        // Calculate total height using explicit summation with better accuracy
        let totalItemHeight = 0;
        for (const item of split.pageItems) {
          totalItemHeight += item.estimatedHeight;
        }
        const usedHeight = totalItemHeight + 30; // 30 for section title
        newPageHeight += usedHeight;
        
        console.log(`Used height: ${usedHeight}, new page height: ${newPageHeight}`);
        
        remainingItems = split.remainingItems.map(item => item.content).filter(item => item != null);
        isFirstPart = false;
      }

      if (remainingItems.length > 0) {
        console.log(`Creating new page for remaining ${remainingItems.length} items`);
        pages.push(updatedCurrentPage);
        updatedCurrentPage = {
          pageNumber: pages.length + 1,
          sections: [],
          partialSections: {}
        };
        newPageHeight = 0;
      }
    }

    return { currentPage: updatedCurrentPage, newPageHeight };
  }

  private handleNonSplittableSection(
    section: TemplateSection,
    sectionData: any,
    currentPage: PageContent,
    pages: PageContent[],
    currentPageHeight: number,
    contentHeight: number,
    orientation: string
  ): { currentPage: PageContent; newPageHeight: number } {
    const estimatedHeight = SectionSplitter.estimateSectionHeight(
      section.section_type, 
      Array.isArray(sectionData) ? sectionData : [sectionData],
      orientation
    );
    
    let updatedCurrentPage = currentPage;
    let newPageHeight = currentPageHeight;

    if (currentPageHeight + estimatedHeight > contentHeight && currentPage.sections.length > 0) {
      pages.push(currentPage);
      updatedCurrentPage = {
        pageNumber: pages.length + 1,
        sections: [],
        partialSections: {}
      };
      newPageHeight = 0;
    }

    updatedCurrentPage.sections.push(section);
    newPageHeight += estimatedHeight;

    return { currentPage: updatedCurrentPage, newPageHeight };
  }

  private splitSection(section: TemplateSection, items: any[], availableHeight: number, sectionTitle: string) {
    switch (section.section_type) {
      case 'experience':
        return SectionSplitter.splitExperienceSection(items, availableHeight, sectionTitle);
      case 'projects':
        return SectionSplitter.splitProjectsSection(items, availableHeight, sectionTitle);
      case 'education':
        return SectionSplitter.splitEducationSection(items, availableHeight, sectionTitle);
      case 'achievements':
        return SectionSplitter.splitAchievementsSection(items, availableHeight, sectionTitle);
      default:
        return { 
          pageItems: items.map((item, index) => ({ 
            id: `default-${index}`,
            content: item, 
            estimatedHeight: 40 
          })), 
          remainingItems: [], 
          sectionTitle 
        };
    }
  }
}
