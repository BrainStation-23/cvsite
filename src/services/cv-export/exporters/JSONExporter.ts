
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';

export class JSONExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings } = options;
    
    try {
      console.log('JSON Export - Starting export process');
      
      if (!profile) {
        throw new Error('Profile data is required for JSON export');
      }

      // Create comprehensive structured JSON data
      const jsonData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportFormat: 'json',
          version: '1.0',
          template: {
            id: template.id,
            name: template.name,
            orientation: template.orientation
          }
        },
        profile: {
          id: profile.id,
          generalInfo: {
            firstName: profile.first_name,
            lastName: profile.last_name,
            fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            email: profile.email,
            phone: profile.phone,
            location: profile.location,
            biography: profile.biography
          }
        },
        sections: this.processSections(sections, profile),
        fieldMappings: fieldMappings?.map(mapping => ({
          id: mapping.id,
          originalField: mapping.original_field_name,
          displayName: mapping.display_name,
          isMasked: mapping.is_masked,
          maskValue: mapping.mask_value,
          fieldOrder: mapping.field_order,
          sectionType: mapping.section_type,
          visibilityRules: mapping.visibility_rules
        })) || [],
        skills: {
          technical: profile.technical_skills || [],
          specialized: profile.specialized_skills || []
        },
        experience: profile.experiences || [],
        education: profile.education || [],
        projects: profile.projects || [],
        trainings: profile.trainings || [],
        achievements: profile.achievements || []
      };

      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const fileName = this.generateFileName(profile, 'json');
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('JSON export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'JSON export failed'
      };
    }
  }

  private processSections(sections: any[], profile: any): any[] {
    return sections
      .sort((a, b) => a.display_order - b.display_order)
      .map(section => ({
        id: section.id,
        type: section.section_type,
        displayOrder: section.display_order,
        isRequired: section.is_required,
        fieldMapping: section.field_mapping,
        stylingConfig: section.styling_config,
        data: this.getSectionData(section, profile)
      }));
  }

  private getSectionData(section: any, profile: any): any {
    switch (section.section_type) {
      case 'general':
      case 'general_info':
        return {
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          biography: profile.biography
        };
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
}
