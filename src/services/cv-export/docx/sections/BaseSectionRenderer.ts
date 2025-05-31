
import { Paragraph, Table } from 'docx';
import { DocumentStyler } from '../DocumentStyler';
import { FieldMaskingService } from '../FieldMaskingService';
import { FieldVisibilityService } from '../FieldVisibilityService';

export abstract class BaseSectionRenderer {
  protected styler!: DocumentStyler;
  protected maskingService!: FieldMaskingService;
  protected visibilityService!: FieldVisibilityService;

  setStyler(styler: DocumentStyler): void {
    this.styler = styler;
  }

  setMaskingService(maskingService: FieldMaskingService): void {
    this.maskingService = maskingService;
  }

  setVisibilityService(visibilityService: FieldVisibilityService): void {
    this.visibilityService = visibilityService;
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

  protected isFieldVisible(fieldName: string, sectionType: string): boolean {
    return this.visibilityService?.isFieldVisible(fieldName, sectionType) ?? true;
  }

  protected applyFieldMasking(value: any, fieldName: string, sectionType: string): any {
    return this.maskingService?.applyMasking(value, fieldName, sectionType) ?? value;
  }

  abstract render(data: any, styles: any): (Paragraph | Table)[] | Promise<(Paragraph | Table)[]>;
}
