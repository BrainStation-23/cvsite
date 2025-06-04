
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import * as ExcelJS from 'exceljs';

export class ExcelExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings } = options;
    
    try {
      console.log('Excel Export - Starting export process');
      
      if (!profile) {
        throw new Error('Profile data is required for Excel export');
      }

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();

      // Add Profile Overview sheet
      this.addProfileOverviewSheet(workbook, profile, template);

      // Add sections as separate sheets
      this.addSectionSheets(workbook, sections, profile);

      // Add Field Mappings sheet
      if (fieldMappings && fieldMappings.length > 0) {
        this.addFieldMappingsSheet(workbook, fieldMappings);
      }

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const fileName = this.generateFileName(profile, 'xlsx');
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('Excel export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Excel export failed'
      };
    }
  }

  private addProfileOverviewSheet(workbook: ExcelJS.Workbook, profile: any, template: any): void {
    const worksheet = workbook.addWorksheet('Profile Overview');
    
    const data = [
      ['CV Profile Overview'],
      [''],
      ['Personal Information'],
      ['First Name', profile.first_name || ''],
      ['Last Name', profile.last_name || ''],
      ['Email', profile.email || ''],
      ['Phone', profile.phone || ''],
      ['Location', profile.location || ''],
      ['Biography', profile.biography || ''],
      [''],
      ['Template Information'],
      ['Template Name', template.name || ''],
      ['Orientation', template.orientation || ''],
      ['Generated On', new Date().toLocaleDateString()]
    ];

    worksheet.addRows(data);
    
    // Style the header
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A3').font = { bold: true };
    worksheet.getCell('A11').font = { bold: true };
  }

  private addSectionSheets(workbook: ExcelJS.Workbook, sections: any[], profile: any): void {
    sections
      .sort((a, b) => a.display_order - b.display_order)
      .forEach(section => {
        const sectionData = this.getSectionData(section, profile);
        if (sectionData) {
          this.createSectionWorksheet(workbook, section, sectionData);
        }
      });
  }

  private getSectionData(section: any, profile: any): any[] | null {
    switch (section.section_type) {
      case 'technical_skills':
        return profile.technical_skills || [];
      case 'specialized_skills':
        return profile.specialized_skills || [];
      case 'experience':
        return profile.experiences || [];
      case 'education':
        return profile.education || [];
      case 'projects':
        return profile.projects || [];
      case 'trainings':
        return profile.trainings || [];
      case 'achievements':
        return profile.achievements || [];
      default:
        return null;
    }
  }

  private createSectionWorksheet(workbook: ExcelJS.Workbook, section: any, data: any[]): void {
    const sheetName = this.formatSheetName(section.section_type);
    const worksheet = workbook.addWorksheet(sheetName);

    if (!data || data.length === 0) {
      worksheet.addRows([
        [section.section_type.toUpperCase()],
        ['No data available']
      ]);
      return;
    }

    const sectionType = section.section_type;
    let worksheetData: any[][] = [];

    // Add section header
    worksheetData.push([sectionType.toUpperCase().replace('_', ' ')]);
    worksheetData.push([]);

    switch (sectionType) {
      case 'technical_skills':
      case 'specialized_skills':
        worksheetData.push(['Skill Name', 'Proficiency Level']);
        data.forEach(skill => {
          worksheetData.push([skill.name || '', skill.proficiency || '']);
        });
        break;

      case 'experience':
        worksheetData.push(['Company', 'Designation', 'Start Date', 'End Date', 'Current', 'Description']);
        data.forEach(exp => {
          worksheetData.push([
            exp.company_name || '',
            exp.designation || '',
            exp.start_date || '',
            exp.end_date || '',
            exp.is_current ? 'Yes' : 'No',
            exp.description || ''
          ]);
        });
        break;

      case 'education':
        worksheetData.push(['University', 'Degree', 'Department', 'Start Date', 'End Date', 'Current', 'GPA']);
        data.forEach(edu => {
          worksheetData.push([
            edu.university || '',
            edu.degree || '',
            edu.department || '',
            edu.start_date || '',
            edu.end_date || '',
            edu.is_current ? 'Yes' : 'No',
            edu.gpa || ''
          ]);
        });
        break;

      case 'projects':
        worksheetData.push(['Project Name', 'Role', 'Start Date', 'End Date', 'Current', 'Description', 'Technologies', 'URL']);
        data.forEach(project => {
          worksheetData.push([
            project.name || '',
            project.role || '',
            project.start_date || '',
            project.end_date || '',
            project.is_current ? 'Yes' : 'No',
            project.description || '',
            Array.isArray(project.technologies_used) ? project.technologies_used.join(', ') : '',
            project.url || ''
          ]);
        });
        break;

      case 'trainings':
        worksheetData.push(['Title', 'Provider', 'Certification Date', 'Description', 'Certificate URL']);
        data.forEach(training => {
          worksheetData.push([
            training.title || '',
            training.provider || '',
            training.certification_date || '',
            training.description || '',
            training.certificate_url || ''
          ]);
        });
        break;

      case 'achievements':
        worksheetData.push(['Title', 'Date', 'Description']);
        data.forEach(achievement => {
          worksheetData.push([
            achievement.title || '',
            achievement.date || '',
            achievement.description || ''
          ]);
        });
        break;

      default:
        worksheetData.push(['Data']);
        data.forEach(item => {
          worksheetData.push([JSON.stringify(item)]);
        });
    }

    worksheet.addRows(worksheetData);
    
    // Style the header row
    if (worksheetData.length > 2) {
      const headerRow = worksheet.getRow(3);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }
  }

  private addFieldMappingsSheet(workbook: ExcelJS.Workbook, fieldMappings: any[]): void {
    const worksheet = workbook.addWorksheet('Field Mappings');
    
    const data = [
      ['Field Mappings Configuration'],
      [''],
      ['Original Field', 'Display Name', 'Section Type', 'Is Masked', 'Mask Value', 'Field Order']
    ];

    fieldMappings.forEach(mapping => {
      data.push([
        mapping.original_field_name || '',
        mapping.display_name || '',
        mapping.section_type || '',
        mapping.is_masked ? 'Yes' : 'No',
        mapping.mask_value || '',
        mapping.field_order || ''
      ]);
    });

    worksheet.addRows(data);
    
    // Style the header
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  }

  private formatSheetName(sectionType: string): string {
    // Excel sheet names can't exceed 31 characters and can't contain certain characters
    const formatted = sectionType
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return formatted.length > 31 ? formatted.substring(0, 31) : formatted;
  }
}
