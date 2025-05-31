
import { Document, Table, TableRow, TableCell, Paragraph, WidthType } from 'docx';

export class LayoutProcessor {
  private layoutConfig: Record<string, any> = {};

  setLayoutConfig(layoutConfig: Record<string, any>): void {
    this.layoutConfig = layoutConfig;
  }

  getLayoutType(): string {
    return this.layoutConfig.layout || 'single-column';
  }

  createLayoutStructure(
    leftColumnElements: (Paragraph | Table)[], 
    rightColumnElements: (Paragraph | Table)[] = []
  ): (Paragraph | Table)[] {
    const layoutType = this.getLayoutType();

    switch (layoutType) {
      case 'two-column':
        return this.createTwoColumnLayout(leftColumnElements, rightColumnElements);
      case 'sidebar-left':
        return this.createSidebarLayout(leftColumnElements, rightColumnElements, 'left');
      case 'sidebar-right':
        return this.createSidebarLayout(leftColumnElements, rightColumnElements, 'right');
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

    // Create a table-based two-column layout
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
    sidebarElements: (Paragraph | Table)[],
    sidebarPosition: 'left' | 'right'
  ): (Paragraph | Table)[] {
    const mainWidth = 70;
    const sidebarWidth = 30;

    const leftElements = sidebarPosition === 'left' ? sidebarElements : mainElements;
    const rightElements = sidebarPosition === 'left' ? mainElements : sidebarElements;
    const leftWidth = sidebarPosition === 'left' ? sidebarWidth : mainWidth;
    const rightWidth = sidebarPosition === 'left' ? mainWidth : sidebarWidth;

    const maxLength = Math.max(leftElements.length, rightElements.length);
    const rows: TableRow[] = [];

    for (let i = 0; i < maxLength; i++) {
      const leftCell = new TableCell({
        children: leftElements[i] ? [leftElements[i] as Paragraph] : [new Paragraph({ children: [] })],
        width: { size: leftWidth, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 100, right: 50 }
      });

      const rightCell = new TableCell({
        children: rightElements[i] ? [rightElements[i] as Paragraph] : [new Paragraph({ children: [] })],
        width: { size: rightWidth, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 50, right: 100 }
      });

      rows.push(new TableRow({ children: [leftCell, rightCell] }));
    }

    return [new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })];
  }

  getSectionPlacement(sectionType: string): 'main' | 'sidebar' {
    const sidebarSections = this.layoutConfig.sidebarSections || [];
    return sidebarSections.includes(sectionType) ? 'sidebar' : 'main';
  }
}
