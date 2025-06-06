
import { TemplateSection, FieldMapping, PageContent } from './LayoutStrategyInterface';
import { SectionSplitter } from '@/utils/sectionSplitter';
import { BaseLayoutStrategy } from './BaseLayoutStrategy';
import { PageUtils } from '../utils/PageUtils';

export class SplittableSectionHandler extends BaseLayoutStrategy {
  handleSplittableSection(
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
      
      // Use layout-aware splitting - single column with main placement
      const split = this.splitSection(section, remainingItems, availableHeight, sectionTitle, 'single-column', 'main');

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

  private splitSection(
    section: TemplateSection, 
    items: any[], 
    availableHeight: number, 
    sectionTitle: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ) {
    switch (section.section_type) {
      case 'experience':
        return SectionSplitter.splitExperienceSection(items, availableHeight, sectionTitle, layoutType, placement);
      case 'projects':
        return SectionSplitter.splitProjectsSection(items, availableHeight, sectionTitle, layoutType, placement);
      case 'education':
        return SectionSplitter.splitEducationSection(items, availableHeight, sectionTitle, layoutType, placement);
      case 'achievements':
        return SectionSplitter.splitAchievementsSection(items, availableHeight, sectionTitle, layoutType, placement);
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
