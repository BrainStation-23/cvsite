
import jsPDF from 'jspdf';
import { PDFStyler } from '../PDFStyler';
import { FieldMaskingService } from '../../docx/FieldMaskingService';
import { FieldVisibilityService } from '../../docx/FieldVisibilityService';

export abstract class BasePDFRenderer {
  protected doc: jsPDF;
  protected styler: PDFStyler;
  protected maskingService: FieldMaskingService;
  protected visibilityService: FieldVisibilityService;

  constructor(
    doc: jsPDF, 
    styler: PDFStyler, 
    maskingService: FieldMaskingService, 
    visibilityService: FieldVisibilityService
  ) {
    this.doc = doc;
    this.styler = styler;
    this.maskingService = maskingService;
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

  abstract render(data: any, x: number, y: number, width: number, sectionType: string): Promise<number>;
}
