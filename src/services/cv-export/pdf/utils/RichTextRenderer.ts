
import { PDFStyler } from '../PDFStyler';
import { RichTextElement } from './RichTextParser';

export class RichTextRenderer {
  private styler: PDFStyler;

  constructor(styler: PDFStyler) {
    this.styler = styler;
  }

  renderRichTextContent(elements: RichTextElement[], x: number, y: number, width: number): number {
    let currentY = y;
    
    for (const element of elements) {
      switch (element.type) {
        case 'paragraph':
          const paragraphHeight = this.styler.addText(
            element.content,
            x, currentY, width,
            element.style || {}
          );
          currentY += paragraphHeight + 3;
          break;
          
        case 'listItem':
          const bullet = element.style?.bullet || '•';
          const itemHeight = this.styler.addText(
            `${bullet} ${element.content}`,
            x + 10, currentY, width - 10,
            {}
          );
          currentY += itemHeight + 2;
          break;
      }
    }
    
    return currentY - y;
  }
}
