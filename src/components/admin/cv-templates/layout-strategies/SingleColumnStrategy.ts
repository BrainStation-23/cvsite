
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

    while (remainingItems.length > 0 && pages.length < maxPages) {
      const availableHeight = contentHeight - newPageHeight;
      const split = this.splitSection(section, remainingItems, availableHeight, sectionTitle);

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

        // Fix: Properly access estimatedHeight from each SectionItem
        const usedHeight = split.pageItems.reduce((sum, item) => sum + item.estimatedHeight, 0) + 30;
        newPageHeight += usedHeight;
        remainingItems = split.remainingItems.map(item => item.content).filter(item => item != null);
        isFirstPart = false;
      }

      if (remainingItems.length > 0) {
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
        return { pageItems: items.map(item => ({ content: item, estimatedHeight: 40 })), remainingItems: [], sectionTitle };
    }
  }
}
