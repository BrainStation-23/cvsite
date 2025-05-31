
import { Paragraph, Table } from 'docx';
import { DocumentStyler } from '../DocumentStyler';
import { FieldMaskingService } from '../FieldMaskingService';

export abstract class BaseSectionRenderer {
  protected styler!: DocumentStyler;
  protected maskingService!: FieldMaskingService;

  setStyler(styler: DocumentStyler): void {
    this.styler = styler;
  }

  setMaskingService(maskingService: FieldMaskingService): void {
    this.maskingService = maskingService;
  }

  protected formatDateRange(startDate: string, endDate: string, isCurrent: boolean): string {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
    const end = isCurrent ? 'Present' : (endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
    
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return start;
    } else if (end) {
      return end;
    }
    return '';
  }

  abstract render(data: any, styles: any): (Paragraph | Table)[] | Promise<(Paragraph | Table)[]>;
}
