
import { SectionItem, SectionSplit } from './types';
import { SectionSplitterConstants } from './constants';
import { HeightEstimators } from './heightEstimators';

export class SectionSplitters {
  static splitExperienceSection(
    experiences: any[],
    availableHeight: number,
    sectionTitle: string
  ): SectionSplit {
    const titleHeight = SectionSplitterConstants.SECTION_TITLE_HEIGHT;
    let usedHeight = titleHeight;
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];

    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      const estimatedHeight = HeightEstimators.estimateExperienceItemHeight(exp);
      
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
          estimatedHeight: HeightEstimators.estimateExperienceItemHeight(item)
        })));
        break;
      }
    }

    // Ensure at least one item per page if none fit
    if (pageItems.length === 0 && experiences.length > 0) {
      pageItems.push({
        id: 'exp-0',
        content: experiences[0],
        estimatedHeight: HeightEstimators.estimateExperienceItemHeight(experiences[0])
      });
      remainingItems.push(...experiences.slice(1).map((item, idx) => ({
        id: `exp-${idx + 1}`,
        content: item,
        estimatedHeight: HeightEstimators.estimateExperienceItemHeight(item)
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
    sectionTitle: string
  ): SectionSplit {
    const titleHeight = SectionSplitterConstants.SECTION_TITLE_HEIGHT;
    let usedHeight = titleHeight;
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];

    console.log(`Splitting projects section - Available height: ${availableHeight}, Safety margin: ${SectionSplitterConstants.SAFETY_MARGIN}`);

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const estimatedHeight = HeightEstimators.estimateProjectItemHeight(project);
      const totalNeededHeight = usedHeight + estimatedHeight + SectionSplitterConstants.ITEM_MARGIN + SectionSplitterConstants.SAFETY_MARGIN;
      
      console.log(`Project ${i}: estimated height ${estimatedHeight}, total needed: ${totalNeededHeight}, available: ${availableHeight}`);
      
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
          estimatedHeight: HeightEstimators.estimateProjectItemHeight(item)
        })));
        break;
      }
    }

    // Ensure at least one item per page if none fit
    if (pageItems.length === 0 && projects.length > 0) {
      console.log('No projects fit - forcing at least one project on page');
      pageItems.push({
        id: 'proj-0',
        content: projects[0],
        estimatedHeight: HeightEstimators.estimateProjectItemHeight(projects[0])
      });
      remainingItems.push(...projects.slice(1).map((item, idx) => ({
        id: `proj-${idx + 1}`,
        content: item,
        estimatedHeight: HeightEstimators.estimateProjectItemHeight(item)
      })));
    }

    console.log(`Split result - Page items: ${pageItems.length}, Remaining: ${remainingItems.length}`);

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
    sectionTitle: string
  ): SectionSplit {
    const titleHeight = SectionSplitterConstants.SECTION_TITLE_HEIGHT;
    let usedHeight = titleHeight;
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];

    for (let i = 0; i < education.length; i++) {
      const edu = education[i];
      const estimatedHeight = HeightEstimators.estimateEducationItemHeight(edu);
      
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
          estimatedHeight: HeightEstimators.estimateEducationItemHeight(item)
        })));
        break;
      }
    }

    // Ensure at least one item per page if none fit
    if (pageItems.length === 0 && education.length > 0) {
      pageItems.push({
        id: 'edu-0',
        content: education[0],
        estimatedHeight: HeightEstimators.estimateEducationItemHeight(education[0])
      });
      remainingItems.push(...education.slice(1).map((item, idx) => ({
        id: `edu-${idx + 1}`,
        content: item,
        estimatedHeight: HeightEstimators.estimateEducationItemHeight(item)
      })));
    }

    return {
      pageItems,
      remainingItems,
      sectionTitle: pageItems.length > 0 ? sectionTitle : undefined,
      continuationTitle: remainingItems.length > 0 ? `${sectionTitle} (continued)` : undefined
    };
  }

  static splitAchievementsSection(achievements: any[], availableHeight: number, sectionTitle: string) {
    const ACHIEVEMENT_HEIGHT = 60; // Estimated height per achievement
    const TITLE_HEIGHT = 30;
    
    let usedHeight = TITLE_HEIGHT; // Start with title height
    const pageItems = [];
    
    for (const achievement of achievements) {
      if (usedHeight + ACHIEVEMENT_HEIGHT <= availableHeight - SectionSplitterConstants.SAFETY_MARGIN) {
        pageItems.push({
          content: achievement,
          estimatedHeight: ACHIEVEMENT_HEIGHT
        });
        usedHeight += ACHIEVEMENT_HEIGHT;
      } else {
        break;
      }
    }
    
    // If we couldn't fit any items but this is the first section on the page, take at least one
    if (pageItems.length === 0 && usedHeight === TITLE_HEIGHT && achievements.length > 0) {
      pageItems.push({
        content: achievements[0],
        estimatedHeight: ACHIEVEMENT_HEIGHT
      });
    }
    
    const remainingItems = achievements.slice(pageItems.length).map(achievement => ({
      content: achievement,
      estimatedHeight: ACHIEVEMENT_HEIGHT
    }));
    
    return {
      pageItems,
      remainingItems,
      sectionTitle
    };
  }
}
