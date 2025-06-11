
import { Document, Table, TableRow, TableCell, Paragraph, WidthType } from 'docx';
import { getLayoutConfiguration } from '@/components/admin/cv-templates/layout/LayoutConfigurations';
import { DocumentStyler } from './DocumentStyler';

export class LayoutProcessor {
  private layoutConfig: Record<string, any> = {};
  private styler?: DocumentStyler;

  setLayoutConfig(layoutConfig: Record<string, any>): void {
    this.layoutConfig = layoutConfig;
  }

  setStyler(styler: DocumentStyler): void {
    this.styler = styler;
  }

  getLayoutType(): string {
    return this.layoutConfig.layoutType || 'single-column';
  }

  createLayoutStructure(
    leftColumnElements: (Paragraph | Table)[], 
    rightColumnElements: (Paragraph | Table)[] = []
  ): (Paragraph | Table)[] {
    const layoutType = this.getLayoutType();

    console.log('DOCX Layout Processor - Layout type:', layoutType);
    console.log('DOCX Layout Processor - Left column elements:', leftColumnElements.length);
    console.log('DOCX Layout Processor - Right column elements:', rightColumnElements.length);

    switch (layoutType) {
      case 'two-column':
        return this.createTwoColumnLayout(leftColumnElements, rightColumnElements);
      case 'sidebar':
        return this.createSidebarLayout(leftColumnElements, rightColumnElements);
      case 'single-column':
      default:
        return [...leftColumnElements, ...rightColumnElements];
    }
  }

  private createTwoColumnLayout(
    leftElements: (Paragraph | Table)[],
    rightElements: (Paragraph | Table)[]
  ): (Paragraph | Table)[] {
    if (leftElements.length === 0 && rightElements.length === 0) {
      return [];
    }

    if (!this.styler) {
      console.error('DOCX Layout Processor - No styler available');
      return [...leftElements, ...rightElements];
    }

    // Use the enhanced styler to create a properly styled table
    return [this.styler.createLayoutTable(
      leftElements,
      rightElements,
      'two-column',
      'main',
      'secondary'
    )];
  }

  private createSidebarLayout(
    mainElements: (Paragraph | Table)[],
    sidebarElements: (Paragraph | Table)[]
  ): (Paragraph | Table)[] {
    if (mainElements.length === 0 && sidebarElements.length === 0) {
      return [];
    }

    if (!this.styler) {
      console.error('DOCX Layout Processor - No styler available');
      return [...sidebarElements, ...mainElements];
    }

    // Use the enhanced styler to create a properly styled sidebar layout
    // Note: For sidebar layout, left is sidebar, right is main content
    return [this.styler.createLayoutTable(
      sidebarElements,
      mainElements,
      'sidebar',
      'sidebar',
      'main'
    )];
  }

  getSectionPlacement(section: any): 'main' | 'sidebar' {
    const placement = section.styling_config?.layout_placement || 'main';
    
    console.log(`DOCX Layout Processor - Section ${section.section_type} placement:`, placement);
    
    const layoutType = this.getLayoutType();
    const layoutConfig = getLayoutConfiguration(layoutType);
    
    if (placement === 'sidebar') {
      if (layoutType === 'sidebar') {
        return 'sidebar';
      } else if (layoutType === 'two-column') {
        return 'sidebar'; // We'll treat this as the secondary column
      }
    }
    
    return 'main';
  }
}
