
import { SectionItem, SectionSplit } from './types';
import { SectionSplitterConstants } from './constants';
import { ItemEstimators } from './ItemEstimators';

export class SectionSplitters {
  static splitExperienceSection(
    experiences: any[],
    availableHeight: number,
    sectionTitle: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): SectionSplit {
    return this.splitGenericSection(
      experiences,
      availableHeight,
      sectionTitle,
      (exp) => ItemEstimators.estimateExperienceItemHeight(exp, layoutType, placement),
      'experience',
      layoutType,
      placement
    );
  }

  static splitProjectsSection(
    projects: any[],
    availableHeight: number,
    sectionTitle: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): SectionSplit {
    return this.splitGenericSection(
      projects,
      availableHeight,
      sectionTitle,
      (project) => ItemEstimators.estimateProjectItemHeight(project, layoutType, placement),
      'projects',
      layoutType,
      placement
    );
  }

  static splitEducationSection(
    education: any[],
    availableHeight: number,
    sectionTitle: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): SectionSplit {
    return this.splitGenericSection(
      education,
      availableHeight,
      sectionTitle,
      (edu) => ItemEstimators.estimateEducationItemHeight(edu, layoutType, placement),
      'education',
      layoutType,
      placement
    );
  }

  static splitAchievementsSection(
    achievements: any[],
    availableHeight: number,
    sectionTitle: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): SectionSplit {
    return this.splitGenericSection(
      achievements,
      availableHeight,
      sectionTitle,
      () => 40, // Simple height for achievements
      'achievements',
      layoutType,
      placement
    );
  }

  private static splitGenericSection(
    items: any[],
    availableHeight: number,
    sectionTitle: string,
    heightEstimator: (item: any) => number,
    sectionType: string,
    layoutType: string,
    placement: 'main' | 'sidebar'
  ): SectionSplit {
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];
    
    // Round floating point numbers to avoid precision issues
    const roundedAvailableHeight = Math.round(availableHeight);
    const titleHeight = SectionSplitterConstants.SECTION_TITLE_HEIGHT;
    const safetyMargin = this.getSafetyMargin(layoutType, placement);
    
    // Calculate usable height with safety margin
    const usableHeight = Math.max(0, roundedAvailableHeight - titleHeight - safetyMargin);
    
    console.log(`=== SPLITTING ${sectionType.toUpperCase()} SECTION (${layoutType}/${placement}) ===`);
    console.log(`Available height: ${roundedAvailableHeight}, Usable height: ${usableHeight}`);
    console.log(`Items to process: ${items.length}`);
    
    // If no usable height, return everything as remaining
    if (usableHeight <= 0) {
      console.log(`No usable height available, returning all items as remaining`);
      return {
        pageItems: [],
        remainingItems: items.map((item, index) => ({
          id: `${sectionType}-${index}`,
          content: item,
          estimatedHeight: Math.round(heightEstimator(item))
        })),
        sectionTitle
      };
    }

    // Pre-validate items to identify and handle oversized items
    const validatedItems = this.validateAndTruncateItems(items, usableHeight, heightEstimator, sectionType, layoutType, placement);
    
    let currentHeight = 0;
    
    for (let i = 0; i < validatedItems.length; i++) {
      const { item, estimatedHeight, wasTruncated } = validatedItems[i];
      
      console.log(`Item ${i + 1}: estimated height ${estimatedHeight}, current height: ${currentHeight}${wasTruncated ? ' (truncated)' : ''}`);
      
      // Check if this item can fit
      if (currentHeight + estimatedHeight <= usableHeight) {
        pageItems.push({
          id: `${sectionType}-${i}`,
          content: item,
          estimatedHeight
        });
        currentHeight += estimatedHeight;
        console.log(`✓ Item ${i + 1} fits, new total height: ${currentHeight}`);
      } else {
        // Item doesn't fit, add all remaining items to remainingItems
        console.log(`✗ Item ${i + 1} doesn't fit (would be ${currentHeight + estimatedHeight}), stopping here`);
        
        for (let j = i; j < validatedItems.length; j++) {
          remainingItems.push({
            id: `${sectionType}-${j}`,
            content: validatedItems[j].item,
            estimatedHeight: validatedItems[j].estimatedHeight
          });
        }
        break;
      }
    }
    
    console.log(`Split result: ${pageItems.length} items fit (${currentHeight}/${usableHeight}), ${remainingItems.length} remaining`);
    
    return {
      pageItems,
      remainingItems,
      sectionTitle
    };
  }

  private static validateAndTruncateItems(
    items: any[],
    usableHeight: number,
    heightEstimator: (item: any) => number,
    sectionType: string,
    layoutType: string,
    placement: 'main' | 'sidebar'
  ): Array<{ item: any; estimatedHeight: number; wasTruncated: boolean }> {
    const maxItemHeight = usableHeight * 0.8; // Allow item to take max 80% of page
    
    return items.map((item, index) => {
      const originalHeight = Math.round(heightEstimator(item));
      
      if (originalHeight <= maxItemHeight) {
        return { item, estimatedHeight: originalHeight, wasTruncated: false };
      }
      
      console.log(`Item ${index + 1} too large (${originalHeight}px), attempting to truncate...`);
      
      // Attempt to truncate the item's description if it's a projects/experience item
      if ((sectionType === 'projects' || sectionType === 'experience') && item.description) {
        const truncatedItem = this.truncateItemDescription(item, maxItemHeight, heightEstimator, layoutType, placement);
        const newHeight = Math.round(heightEstimator(truncatedItem));
        
        console.log(`Truncated item ${index + 1}: ${originalHeight}px -> ${newHeight}px`);
        return { item: truncatedItem, estimatedHeight: newHeight, wasTruncated: true };
      }
      
      // If we can't truncate or it's still too large, use a fallback height
      const fallbackHeight = Math.min(maxItemHeight, originalHeight);
      console.log(`Using fallback height for item ${index + 1}: ${fallbackHeight}px`);
      
      return { item, estimatedHeight: fallbackHeight, wasTruncated: true };
    });
  }

  private static truncateItemDescription(
    item: any,
    targetHeight: number,
    heightEstimator: (item: any) => number,
    layoutType: string,
    placement: 'main' | 'sidebar'
  ): any {
    if (!item.description) return item;
    
    const originalDescription = item.description;
    let truncatedDescription = originalDescription;
    
    // Try progressively shorter descriptions
    const reductionFactors = [0.75, 0.5, 0.25, 0.1];
    
    for (const factor of reductionFactors) {
      const targetLength = Math.floor(originalDescription.length * factor);
      truncatedDescription = originalDescription.substring(0, targetLength);
      
      // Add ellipsis if truncated
      if (truncatedDescription.length < originalDescription.length) {
        truncatedDescription += '...';
      }
      
      const testItem = { ...item, description: truncatedDescription };
      const testHeight = heightEstimator(testItem);
      
      if (testHeight <= targetHeight) {
        break;
      }
    }
    
    return { ...item, description: truncatedDescription };
  }

  private static getSafetyMargin(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 30 : 25; // Reduced safety margins
      case 'two-column':
        return 25; // Reduced from 35
      case 'single-column':
      default:
        return 20; // Reduced from 25
    }
  }
}
