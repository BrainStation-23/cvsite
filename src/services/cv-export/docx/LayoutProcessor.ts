
import { Document, Table, TableRow, TableCell, Paragraph, WidthType } from 'docx';
import { getLayoutConfiguration } from '@/components/admin/cv-templates/layout/LayoutConfigurations';

export class LayoutProcessor {
  private layoutConfig: Record<string, any> = {};

  setLayoutConfig(layoutConfig: Record<string, any>): void {
    this.layoutConfig = layoutConfig;
  }

  getLayoutType(): string {
    // Use layoutType instead of layout to match template structure
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

    // Create a table-based two-column layout with equal widths
    const maxLength = Math.max(leftElements.length, rightElements.length);
    const rows: TableRow[] = [];

    for (let i = 0; i < maxLength; i++) {
      const leftCell = new TableCell({
        children: leftElements[i] ? [leftElements[i] as Paragraph] : [new Paragraph({ children: [] })],
        width: { size: 50, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 100, right: 50 }
      });

      const rightCell = new TableCell({
        children: rightElements[i] ? [rightElements[i] as Paragraph] : [new Paragraph({ children: [] })],
        width: { size: 50, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 50, right: 100 }
      });

      rows.push(new TableRow({ children: [leftCell, rightCell] }));
    }

    return [new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })];
  }

  private createSidebarLayout(
    mainElements: (Paragraph | Table)[],
    sidebarElements: (Paragraph | Table)[]
  ): (Paragraph | Table)[] {
    const sidebarWidth = 30; // Sidebar takes 30%
    const mainWidth = 70;    // Main content takes 70%

    const maxLength = Math.max(mainElements.length, sidebarElements.length);
    const rows: TableRow[] = [];

    for (let i = 0; i < maxLength; i++) {
      // Sidebar on the left, main content on the right
      const sidebarCell = new TableCell({
        children: sidebarElements[i] ? [sidebarElements[i] as Paragraph] : [new Paragraph({ children: [] })],
        width: { size: sidebarWidth, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 100, right: 50 }
      });

      const mainCell = new TableCell({
        children: mainElements[i] ? [mainElements[i] as Paragraph] : [new Paragraph({ children: [] })],
        width: { size: mainWidth, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 50, right: 100 }
      });

      rows.push(new TableRow({ children: [sidebarCell, mainCell] }));
    }

    return [new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })];
  }

  getSectionPlacement(section: any): 'main' | 'sidebar' {
    // Use the same logic as HTML export - read from section.styling_config.layout_placement
    const placement = section.styling_config?.layout_placement || 'main';
    
    console.log(`DOCX Layout Processor - Section ${section.section_type} placement:`, placement);
    
    // Map placement to zones based on layout type
    const layoutType = this.getLayoutType();
    const layoutConfig = getLayoutConfiguration(layoutType);
    
    // For sidebar layout, 'sidebar' placement maps to 'sidebar' zone
    // For two-column layout, 'sidebar' placement maps to 'secondary' zone
    // For single-column, everything goes to 'main'
    
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
