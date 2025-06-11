
export interface SectionItem {
  id: string;
  content: any;
  estimatedHeight: number;
}

export interface SectionSplit {
  pageItems: SectionItem[];
  remainingItems: SectionItem[];
  sectionTitle?: string;
  continuationTitle?: string;
}
