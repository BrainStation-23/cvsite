
import { SectionSplitter } from '@/utils/sectionSplitter';
import { 
  getSectionData, 
  getSectionTitle, 
  canSectionBeSplit, 
  splitSectionData,
  PageContent 
} from '../utils/pageDistributionUtils';

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

interface SectionProcessorProps {
  section: TemplateSection;
  profile: any;
  fieldMappings: FieldMapping[];
  currentPage: PageContent;
  currentPageHeight: number;
  contentHeight: number;
  orientation: string;
  onPageUpdate: (page: PageContent, height: number) => void;
  onNewPage: () => PageContent;
}

export const SectionProcessor = ({
  section,
  profile,
  fieldMappings,
  currentPage,
  currentPageHeight,
  contentHeight,
  orientation,
  onPageUpdate,
  onNewPage
}: SectionProcessorProps) => {
  const sectionData = getSectionData(profile, section.section_type);
  const sectionTitle = getSectionTitle(section, fieldMappings);
  
  if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
    return { currentPage, currentPageHeight, shouldContinue: true };
  }

  // For sections that can be split
  if (canSectionBeSplit(section.section_type) && Array.isArray(sectionData)) {
    return processSplittableSection({
      section,
      sectionData,
      sectionTitle,
      currentPage,
      currentPageHeight,
      contentHeight,
      onPageUpdate,
      onNewPage
    });
  } else {
    return processNonSplittableSection({
      section,
      sectionData,
      currentPage,
      currentPageHeight,
      contentHeight,
      orientation,
      onPageUpdate,
      onNewPage
    });
  }
};

function processSplittableSection({
  section,
  sectionData,
  sectionTitle,
  currentPage,
  currentPageHeight,
  contentHeight,
  onPageUpdate,
  onNewPage
}: {
  section: TemplateSection;
  sectionData: any[];
  sectionTitle: string;
  currentPage: PageContent;
  currentPageHeight: number;
  contentHeight: number;
  onPageUpdate: (page: PageContent, height: number) => void;
  onNewPage: () => PageContent;
}) {
  let remainingItems = sectionData.filter(item => item != null);
  let isFirstPart = true;
  let workingPage = currentPage;
  let workingPageHeight = currentPageHeight;

  while (remainingItems.length > 0) {
    const availableHeight = contentHeight - workingPageHeight;
    const split = splitSectionData(section.section_type, remainingItems, availableHeight, sectionTitle);

    if (split.pageItems.length > 0) {
      // Add section to current page
      if (!workingPage.sections.find(s => s.id === section.id)) {
        workingPage.sections.push(section);
      }
      
      const validItems = split.pageItems
        .map(item => item.content)
        .filter(item => item != null);
      
      workingPage.partialSections[section.id] = {
        items: validItems,
        startIndex: sectionData.length - remainingItems.length,
        totalItems: sectionData.length,
        isPartial: remainingItems.length > split.pageItems.length,
        title: isFirstPart ? sectionTitle : `${sectionTitle} (continued)`
      };

      // Fix: Properly calculate the used height by reducing to number type
      const usedHeight = split.pageItems.reduce<number>((sum, item) => sum + item.estimatedHeight, 0) + 30;
      workingPageHeight += usedHeight;
      
      // Fix: Access content property from SectionItem objects
      remainingItems = split.remainingItems.map(item => item.content).filter(item => item != null);
      isFirstPart = false;
    }

    // Start new page if there are remaining items
    if (remainingItems.length > 0) {
      onPageUpdate(workingPage, workingPageHeight);
      workingPage = onNewPage();
      workingPageHeight = 0;
    }
  }

  return { currentPage: workingPage, currentPageHeight: workingPageHeight, shouldContinue: true };
}

function processNonSplittableSection({
  section,
  sectionData,
  currentPage,
  currentPageHeight,
  contentHeight,
  orientation,
  onPageUpdate,
  onNewPage
}: {
  section: TemplateSection;
  sectionData: any;
  currentPage: PageContent;
  currentPageHeight: number;
  contentHeight: number;
  orientation: string;
  onPageUpdate: (page: PageContent, height: number) => void;
  onNewPage: () => PageContent;
}) {
  const estimatedHeight = SectionSplitter.estimateSectionHeight(
    section.section_type, 
    Array.isArray(sectionData) ? sectionData : [sectionData],
    orientation
  );
  
  let workingPage = currentPage;
  let workingPageHeight = currentPageHeight;

  if (workingPageHeight + estimatedHeight > contentHeight && workingPage.sections.length > 0) {
    // Start new page
    onPageUpdate(workingPage, workingPageHeight);
    workingPage = onNewPage();
    workingPageHeight = 0;
  }

  workingPage.sections.push(section);
  workingPageHeight += estimatedHeight;

  return { currentPage: workingPage, currentPageHeight: workingPageHeight, shouldContinue: true };
}
