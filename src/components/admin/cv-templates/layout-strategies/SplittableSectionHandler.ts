
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
    fieldMappings: FieldMapping[],
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
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
    let iterationCount = 0;
    const maxIterations = Math.min(maxPages * 2, 20); // Prevent infinite loops

    console.log(`=== SPLITTING ${section.section_type.toUpperCase()} SECTION (${layoutType}/${placement}) ===`);
    console.log(`Starting with ${limitedSectionData.length} items, current page height: ${currentPageHeight}`);

    while (remainingItems.length > 0 && pages.length < maxPages && iterationCount < maxIterations) {
      iterationCount++;
      
      const availableHeight = contentHeight - newPageHeight;
      console.log(`Iteration ${iterationCount}: Available height for splitting: ${availableHeight}`);
      
      // Add minimum height requirement to prevent infinite loops
      if (availableHeight < 100) {
        console.log(`Available height too small (${availableHeight}), moving to new page`);
        if (updatedCurrentPage.sections.length > 0 || Object.keys(updatedCurrentPage.partialSections).length > 0) {
          pages.push(updatedCurrentPage);
        }
        updatedCurrentPage = {
          pageNumber: pages.length + 1,
          sections: [],
          partialSections: {}
        };
        newPageHeight = 0;
        continue;
      }
      
      // Use layout-aware splitting with proper context
      const split = this.splitSection(section, remainingItems, availableHeight, sectionTitle, layoutType, placement);

      console.log(`Split result: ${split.pageItems.length} items fit, ${split.remainingItems.length} remaining`);

      // If no items fit and we have available height, there might be an estimation issue
      if (split.pageItems.length === 0 && availableHeight > 100) {
        console.log(`No items fit despite available height (${availableHeight}), forcing page break`);
        if (updatedCurrentPage.sections.length > 0 || Object.keys(updatedCurrentPage.partialSections).length > 0) {
          pages.push(updatedCurrentPage);
        }
        updatedCurrentPage = {
          pageNumber: pages.length + 1,
          sections: [],
          partialSections: {}
        };
        newPageHeight = 0;
        continue;
      }

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
          isPartial: split.remainingItems.length > 0,
          title: isFirstPart ? sectionTitle : `${sectionTitle} (continued)`
        };

        // Calculate total height using explicit summation with layout-aware accuracy
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

    if (iterationCount >= maxIterations) {
      console.error(`Maximum iterations reached (${maxIterations}) for section ${section.section_type}, forcing termination`);
    }

    console.log(`=== SPLITTING COMPLETE ===`);
    console.log(`Final result: ${pages.length} pages created, ${remainingItems.length} items remaining`);

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
    console.log(`Splitting section ${section.section_type} with layout context: ${layoutType}/${placement}`);
    
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
