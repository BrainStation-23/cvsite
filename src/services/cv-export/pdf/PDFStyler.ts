
import jsPDF from 'jspdf';

export class PDFStyler {
  private doc: jsPDF;
  private baseStyles: any = {};

  constructor(doc: jsPDF) {
    this.doc = doc;
  }

  setBaseStyles(styles: any): void {
    this.baseStyles = styles;
  }

  getFontSize(type: 'title' | 'heading' | 'subheading' | 'base' | 'small' = 'base'): number {
    const baseFontSize = this.baseStyles.baseFontSize || 12;
    
    switch (type) {
      case 'title':
        return baseFontSize + 6;
      case 'heading':
        return baseFontSize + 4;
      case 'subheading':
        return baseFontSize + 2;
      case 'base':
        return baseFontSize;
      case 'small':
        return baseFontSize - 2;
      default:
        return baseFontSize;
    }
  }

  parseColor(colorString: string): [number, number, number] {
    // Convert hex color to RGB
    if (colorString.startsWith('#')) {
      const hex = colorString.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return [r, g, b];
    }
    
    // Default to black
    return [0, 0, 0];
  }

  setTextStyle(
    fontSize: number,
    color: string = '#000000',
    bold: boolean = false,
    italic: boolean = false
  ): void {
    this.doc.setFontSize(fontSize);
    
    const [r, g, b] = this.parseColor(color);
    this.doc.setTextColor(r, g, b);
    
    let fontStyle = 'normal';
    if (bold && italic) {
      fontStyle = 'bolditalic';
    } else if (bold) {
      fontStyle = 'bold';
    } else if (italic) {
      fontStyle = 'italic';
    }
    
    this.doc.setFont('helvetica', fontStyle);
  }

  addSectionTitle(text: string, x: number, y: number, width: number): number {
    this.setTextStyle(
      this.getFontSize('heading'),
      this.baseStyles.primaryColor || '#1f2937',
      true
    );
    
    const lines = this.doc.splitTextToSize(text, width);
    this.doc.text(lines, x, y);
    
    // Add underline
    const textHeight = this.getFontSize('heading') * 0.3;
    this.doc.line(x, y + 2, x + width, y + 2);
    
    return lines.length * (this.getFontSize('heading') * 0.3) + 5;
  }

  addText(
    text: string,
    x: number,
    y: number,
    width: number,
    options: {
      fontSize?: number;
      color?: string;
      bold?: boolean;
      italic?: boolean;
      align?: 'left' | 'center' | 'right';
    } = {}
  ): number {
    const {
      fontSize = this.getFontSize('base'),
      color = '#000000',
      bold = false,
      italic = false,
      align = 'left'
    } = options;

    this.setTextStyle(fontSize, color, bold, italic);
    
    const lines = this.doc.splitTextToSize(text, width);
    
    lines.forEach((line: string, index: number) => {
      let textX = x;
      if (align === 'center') {
        const lineWidth = this.doc.getTextWidth(line);
        textX = x + (width - lineWidth) / 2;
      } else if (align === 'right') {
        const lineWidth = this.doc.getTextWidth(line);
        textX = x + width - lineWidth;
      }
      
      this.doc.text(line, textX, y + (index * fontSize * 0.3));
    });
    
    return lines.length * (fontSize * 0.3) + 2;
  }

  addBulletPoint(text: string, x: number, y: number, width: number): number {
    // Add bullet
    this.setTextStyle(this.getFontSize('base'));
    this.doc.text('•', x, y);
    
    // Add text with indent
    const textWidth = width - 10;
    const lines = this.doc.splitTextToSize(text, textWidth);
    
    lines.forEach((line: string, index: number) => {
      this.doc.text(line, x + 10, y + (index * this.getFontSize('base') * 0.3));
    });
    
    return lines.length * (this.getFontSize('base') * 0.3) + 2;
  }
}
