
import { SectionItem, SectionSplit } from './types';
import { SectionSplitterConstants } from './constants';
import { HeightEstimators } from './heightEstimators';

export class SectionSplitters {
  static splitExperienceSection(
    experiences: any[],
    availableHeight: number,
    sectionTitle: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): SectionSplit {
    const titleHeight = SectionSplitterConstants.SECTION_TITLE_HEIGHT;
    let usedHeight = titleHeight;
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];

    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      const estimatedHeight = HeightEstimators.estimateExperienceItemHeightWithLayout(exp, layoutType, placement);
      
      if (usedHeight + estimatedHeight + SectionSplitterConstants.ITEM_MARGIN <= availableHeight - SectionSplitterConstants.SAFETY_MARGIN) {
        pageItems.push({
          id: `exp-${i}`,
          content: exp,
          estimatedHeight
        });
        usedHeight += estimatedHeight + SectionSplitterConstants.ITEM_MARGIN;
      } else {
        remainingItems.push(...experiences.slice(i).map((item, idx) => ({
          id: `exp-${i + idx}`,
          content: item,
          estimatedHeight: HeightEstimators.estimateExperienceItemHeightWithLayout(item, layoutType, placement)
        })));
        break;
      }
    }

    // Ensure at least one item per page if none fit
    if (pageItems.length === 0 && experiences.length > 0) {
      pageItems.push({
        id: 'exp-0',
        content: experiences[0],
        estimatedHeight: HeightEstimators.estimateExperienceItemHeightWithLayout(experiences[0], layoutType, placement)
      });
      remainingItems.push(...experiences.slice(1).map((item, idx) => ({
        id: `exp-${idx + 1}`,
        content: item,
        estimatedHeight: HeightEstimators.estimateExperienceItemHeightWithLayout(item, layoutType, placement)
      })));
    }

    return {
      pageItems,
      remainingItems,
      sectionTitle: pageItems.length > 0 ? sectionTitle : undefined,
      continuationTitle: remainingItems.length > 0 ? `${sectionTitle} (continued)` : undefined
    };
  }

  static splitProjectsSection(
    projects: any[],
    availableHeight: number,
    sectionTitle: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): SectionSplit {
    const titleHeight = SectionSplitterConstants.SECTION_TITLE_HEIGHT;
    let usedHeight = titleHeight;
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];

    console.log(`Splitting projects section (${layoutType}/${placement}) - Available height: ${availableHeight}, Safety margin: ${SectionSplitterConstants.SAFETY_MARGIN}`);

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const estimatedHeight = HeightEstimators.estimateProjectItemHeightWithLayout(project, layoutType, placement);
      const totalNeededHeight = usedHeight + estimatedHeight + SectionSplitterConstants.ITEM_MARGIN + SectionSplitterConstants.SAFETY_MARGIN;
      
      console.log(`Project ${i} (${layoutType}/${placement}): estimated height ${estimatedHeight}, total needed: ${totalNeededHeight}, available: ${availableHeight}`);
      
      if (totalNeededHeight <= availableHeight) {
        pageItems.push({
          id: `proj-${i}`,
          content: project,
          estimatedHeight
        });
        usedHeight += estimatedHeight + SectionSplitterConstants.ITEM_MARGIN;
      } else {
        remainingItems.push(...projects.slice(i).map((item, idx) => ({
          id: `proj-${i + idx}`,
          content: item,
          estimatedHeight: HeightEstimators.estimateProjectItemHeightWithLayout(item, layoutType, placement)
        })));
        break;
      }
    }

    // Ensure at least one item per page if none fit
    if (pageItems.length === 0 && projects.length > 0) {
      console.log(`No projects fit (${layoutType}/${placement}) - forcing at least one project on page`);
      pageItems.push({
        id: 'proj-0',
        content: projects[0],
        estimatedHeight: HeightEstimators.estimateProjectItemHeightWithLayout(projects[0], layoutType, placement)
      });
      remainingItems.push(...projects.slice(1).map((item, idx) => ({
        id: `proj-${idx + 1}`,
        content: item,
        estimatedHeight: HeightEstimators.estimateProjectItemHeightWithLayout(item, layoutType, placement)
      })));
    }

    console.log(`Split result (${layoutType}/${placement}) - Page items: ${pageItems.length}, Remaining: ${remainingItems.length}`);

    return {
      pageItems,
      remainingItems,
      sectionTitle: pageItems.length > 0 ? sectionTitle : undefined,
      continuationTitle: remainingItems.length > 0 ? `${sectionTitle} (continued)` : undefined
    };
  }

  static splitEducationSection(
    education: any[],
    availableHeight: number,
    sectionTitle: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): SectionSplit {
    const titleHeight = SectionSplitterConstants.SECTION_TITLE_HEIGHT;
    let usedHeight = titleHeight;
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];

    for (let i = 0; i < education.length; i++) {
      const edu = education[i];
      const estimatedHeight = HeightEstimators.estimateEducationItemHeightWithLayout(edu, layoutType, placement);
      
      if (usedHeight + estimatedHeight + SectionSplitterConstants.ITEM_MARGIN <= availableHeight - SectionSplitterConstants.SAFETY_MARGIN) {
        pageItems.push({
          id: `edu-${i}`,
          content: edu,
          estimatedHeight
        });
        usedHeight += estimatedHeight + SectionSplitterConstants.ITEM_MARGIN;
      } else {
        remainingItems.push(...education.slice(i).map((item, idx) => ({
          id: `edu-${i + idx}`,
          content: item,
          estimatedHeight: HeightEstimators.estimateEducationItemHeightWithLayout(item, layoutType, placement)
        })));
        break;
      }
    }

    // Ensure at least one item per page if none fit
    if (pageItems.length === 0 && education.length > 0) {
      pageItems.push({
        id: 'edu-0',
        content: education[0],
        estimatedHeight: HeightEstimators.estimateEducationItemHeightWithLayout(education[0], layoutType, placement)
      });
      remainingItems.push(...education.slice(1).map((item, idx) => ({
        id: `edu-${idx + 1}`,
        content: item,
        estimatedHeight: HeightEstimators.estimateEducationItemHeightWithLayout(item, layoutType, placement)
      })));
    }

    return {
      pageItems,
      remainingItems,
      sectionTitle: pageItems.length > 0 ? sectionTitle : undefined,
      continuationTitle: remainingItems.length > 0 ? `${sectionTitle} (continued)` : undefined
    };
  }

  static splitAchievementsSection(
    achievements: any[], 
    availableHeight: number, 
    sectionTitle: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ) {
    // Use layout-aware height calculation
    const achievementHeight = layoutType === 'sidebar' && placement === 'sidebar' ? 50 : 60;
    const TITLE_HEIGHT = 30;
    
    let usedHeight = TITLE_HEIGHT;
    const pageItems = [];
    
    for (const achievement of achievements) {
      if (usedHeight + achievementHeight <= availableHeight - SectionSplitterConstants.SAFETY_MARGIN) {
        pageItems.push({
          content: achievement,
          estimatedHeight: achievementHeight
        });
        usedHeight += achievementHeight;
      } else {
        break;
      }
    }
    
    // If we couldn't fit any items but this is the first section on the page, take at least one
    if (pageItems.length === 0 && usedHeight === TITLE_HEIGHT && achievements.length > 0) {
      pageItems.push({
        content: achievements[0],
        estimatedHeight: achievementHeight
      });
    }
    
    const remainingItems = achievements.slice(pageItems.length).map(achievement => ({
      content: achievement,
      estimatedHeight: achievementHeight
    }));
    
    return {
      pageItems,
      remainingItems,
      sectionTitle
    };
  }
}
