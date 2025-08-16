
export interface PageBreakPoint {
  position: number;
  reason: string;
  priority: number;
}

export class ContentAnalyzer {
  private readonly SECTION_SELECTORS = [
    'h1', 'h2', 'h3', '.section', '.cv-section',
    '.experience-item', '.education-item', '.project-item'
  ];

  private readonly AVOID_BREAK_SELECTORS = [
    '.contact-info', '.summary', '.no-break'
  ];

  analyzeContent(htmlContent: string): string {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Find logical break points
    const breakPoints = this.findBreakPoints(tempDiv);
    
    // Insert page breaks at strategic locations
    return this.insertPageBreaks(htmlContent, breakPoints);
  }

  private findBreakPoints(element: Element): PageBreakPoint[] {
    const breakPoints: PageBreakPoint[] = [];
    
    // Look for major sections that should start on new pages
    const majorSections = element.querySelectorAll('h1, h2, .cv-section');
    majorSections.forEach((section, index) => {
      if (index > 0) { // Don't break before the first section
        breakPoints.push({
          position: this.getElementPosition(element, section),
          reason: 'major-section',
          priority: 1
        });
      }
    });

    // Look for experience/education items that could break
    const items = element.querySelectorAll('.experience-item, .education-item, .project-item');
    items.forEach((item, index) => {
      if (index > 0 && index % 3 === 0) { // Every 3rd item
        breakPoints.push({
          position: this.getElementPosition(element, item),
          reason: 'item-group',
          priority: 2
        });
      }
    });

    return breakPoints.sort((a, b) => a.position - b.position);
  }

  private getElementPosition(container: Element, element: Element): number {
    const containerHTML = container.innerHTML;
    const elementHTML = element.outerHTML;
    return containerHTML.indexOf(elementHTML);
  }

  private insertPageBreaks(htmlContent: string, breakPoints: PageBreakPoint[]): string {
    let result = htmlContent;
    let offset = 0;

    // Insert page breaks from end to beginning to maintain positions
    breakPoints.reverse().forEach(breakPoint => {
      const pageBreakDiv = '<div class="html2pdf__page-break"></div>';
      const insertPosition = breakPoint.position + offset;
      
      result = result.slice(0, insertPosition) + pageBreakDiv + result.slice(insertPosition);
      offset += pageBreakDiv.length;
    });

    return result;
  }
}

export const analyzeAndInsertPageBreaks = (htmlContent: string): string => {
  const analyzer = new ContentAnalyzer();
  return analyzer.analyzeContent(htmlContent);
};
