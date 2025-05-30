import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType, Table, TableRow, TableCell, ImageRun } from 'docx';

export class DOCXExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('DOCX Export - Starting export process');
      console.log('DOCX Export - Template:', template?.name);
      console.log('DOCX Export - Profile:', profile?.first_name, profile?.last_name);
      console.log('DOCX Export - Sections count:', sections?.length);
      
      if (!profile) {
        throw new Error('Profile data is required for export');
      }

      if (!sections || sections.length === 0) {
        throw new Error('No sections configured for export');
      }
      
      const doc = await this.createDocument(template, profile, sections, fieldMappings, styles);
      console.log('DOCX Export - Document created successfully');
      
      const blob = await Packer.toBlob(doc);
      console.log('DOCX Export - Blob created, size:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Generated document is empty');
      }
      
      const fileName = this.generateFileName(profile, 'docx');
      console.log('DOCX Export - Downloading file:', fileName);
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('DOCX export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'DOCX export failed'
      };
    }
  }

  private async createDocument(template: any, profile: any, sections: any[], fieldMappings: any[], styles: any): Promise<Document> {
    try {
      const baseStyles = styles?.baseStyles || {};
      const orientation = template?.orientation || 'portrait';
      
      console.log('Creating document with orientation:', orientation);
      
      const documentChildren: (Paragraph | Table)[] = [];
      
      // Add a test paragraph to ensure document isn't empty
      documentChildren.push(new Paragraph({
        children: [
          new TextRun({
            text: "CV Document",
            bold: true,
            size: 24
          })
        ],
        spacing: { after: 240 }
      }));
      
      // Sort sections by display order
      const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
      console.log('Processing sections:', sortedSections.map(s => s.section_type));
      
      for (const section of sortedSections) {
        try {
          const sectionElements = await this.renderSection(section, profile, fieldMappings, styles);
          if (sectionElements.length > 0) {
            documentChildren.push(...sectionElements);
            console.log(`Added ${sectionElements.length} elements for section: ${section.section_type}`);
          }
        } catch (sectionError) {
          console.error(`Error rendering section ${section.section_type}:`, sectionError);
          // Continue with other sections even if one fails
        }
      }
      
      console.log('Total document elements:', documentChildren.length);
      
      // Calculate page dimensions in twips (1/20th of a point)
      const pageWidth = orientation === 'portrait' ? 11906 : 16838; // A4 width in twips
      const pageHeight = orientation === 'portrait' ? 16838 : 11906; // A4 height in twips
      const margin = Math.max((baseStyles.margin || 20) * 56.7, 1134); // Convert mm to twips, minimum 1 inch
      
      return new Document({
        sections: [{
          properties: {
            page: {
              size: {
                orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
                width: pageWidth,
                height: pageHeight
              },
              margin: {
                top: margin,
                right: margin,
                bottom: margin,
                left: margin
              }
            }
          },
          children: documentChildren
        }]
      });
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  private async renderSection(section: any, profile: any, fieldMappings: any[], styles: any): Promise<(Paragraph | Table)[]> {
    const elements: (Paragraph | Table)[] = [];
    
    try {
      const sectionData = this.getSectionData(profile, section.section_type);
      
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        console.log(`Skipping empty section: ${section.section_type}`);
        return elements;
      }

      const sectionTitle = this.getSectionTitle(section, fieldMappings);
      console.log(`Rendering section: ${section.section_type} with title: ${sectionTitle}`);

      // Add section title
      elements.push(new Paragraph({
        children: [
          new TextRun({
            text: sectionTitle,
            bold: true,
            size: (styles?.baseStyles?.subheadingSize || 14) * 2,
            color: this.parseColor(styles?.baseStyles?.primaryColor || '#1f2937')
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 1,
            color: this.parseColor(styles?.baseStyles?.accentColor || '#3b82f6')
          }
        }
      }));

      // Render section content based on type
      switch (section.section_type) {
        case 'general':
          elements.push(...this.renderGeneralSection(profile, styles));
          break;
        case 'experience':
          elements.push(...this.renderExperienceSection(profile.experiences || [], styles, fieldMappings));
          break;
        case 'education':
          elements.push(...this.renderEducationSection(profile.education || [], styles, fieldMappings));
          break;
        case 'projects':
          elements.push(...this.renderProjectsSection(profile.projects || [], styles, fieldMappings));
          break;
        case 'technical_skills':
          elements.push(...this.renderSkillsSection(profile.technical_skills || [], 'Technical Skills', styles));
          break;
        case 'specialized_skills':
          elements.push(...this.renderSkillsSection(profile.specialized_skills || [], 'Specialized Skills', styles));
          break;
        case 'training':
          elements.push(...this.renderTrainingSection(profile.trainings || [], styles, fieldMappings));
          break;
        case 'achievements':
          elements.push(...this.renderAchievementsSection(profile.achievements || [], styles, fieldMappings));
          break;
        default:
          console.log(`Unknown section type: ${section.section_type}`);
      }

      console.log(`Section ${section.section_type} rendered with ${elements.length} elements`);
      return elements;
    } catch (error) {
      console.error(`Error rendering section ${section.section_type}:`, error);
      return elements;
    }
  }

  private renderGeneralSection(profile: any, styles: any): Paragraph[] {
    const elements: Paragraph[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      // Name
      if (profile.first_name || profile.last_name) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
              bold: true,
              size: (baseStyles.headingSize || 16) * 2,
              color: this.parseColor(baseStyles.primaryColor || '#1f2937')
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }));
      }

      // Job Title
      if (profile.designation?.name || profile.job_title) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: profile.designation?.name || profile.job_title,
              size: (baseStyles.subheadingSize || 14) * 2,
              color: this.parseColor(baseStyles.secondaryColor || '#6b7280')
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 }
        }));
      }

      // Contact Information
      const contactInfo: string[] = [];
      if (profile.email) contactInfo.push(`Email: ${profile.email}`);
      if (profile.phone) contactInfo.push(`Phone: ${profile.phone}`);
      if (profile.location) contactInfo.push(`Location: ${profile.location}`);

      if (contactInfo.length > 0) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: contactInfo.join(' | '),
              size: (baseStyles.baseFontSize || 12) * 2
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 }
        }));
      }

      // Summary
      if (profile.summary) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: profile.summary,
              size: (baseStyles.baseFontSize || 12) * 2
            })
          ],
          spacing: { after: 240 }
        }));
      }
    } catch (error) {
      console.error('Error rendering general section:', error);
    }

    return elements;
  }

  private renderExperienceSection(experiences: any[], styles: any, fieldMappings: any[]): Paragraph[] {
    const elements: Paragraph[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      experiences.forEach((exp, index) => {
        // Job Title and Company
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: exp.job_title || '',
              bold: true,
              size: (baseStyles.baseFontSize || 12) * 2,
              color: this.parseColor(baseStyles.primaryColor || '#1f2937')
            }),
            new TextRun({
              text: exp.company_name ? ` at ${exp.company_name}` : '',
              size: (baseStyles.baseFontSize || 12) * 2
            })
          ],
          spacing: { before: 120, after: 60 }
        }));

        // Date Range
        if (exp.start_date || exp.end_date) {
          const dateRange = this.formatDateRange(exp.start_date, exp.end_date, exp.is_current);
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: dateRange,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Description
        if (exp.description) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: exp.description,
                size: (baseStyles.baseFontSize || 12) * 2
              })
            ],
            spacing: { after: 120 }
          }));
        }
      });
    } catch (error) {
      console.error('Error rendering experience section:', error);
    }

    return elements;
  }

  private renderEducationSection(education: any[], styles: any, fieldMappings: any[]): Paragraph[] {
    const elements: Paragraph[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      education.forEach((edu, index) => {
        // Degree and Institution
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: edu.degree?.name || edu.degree_name || '',
              bold: true,
              size: (baseStyles.baseFontSize || 12) * 2,
              color: this.parseColor(baseStyles.primaryColor || '#1f2937')
            }),
            new TextRun({
              text: edu.university?.name ? ` - ${edu.university.name}` : '',
              size: (baseStyles.baseFontSize || 12) * 2
            })
          ],
          spacing: { before: 120, after: 60 }
        }));

        // Date Range
        if (edu.start_date || edu.end_date) {
          const dateRange = this.formatDateRange(edu.start_date, edu.end_date, false);
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: dateRange,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // GPA
        if (edu.gpa) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: `GPA: ${edu.gpa}`,
                size: (baseStyles.baseFontSize || 12) * 2
              })
            ],
            spacing: { after: 120 }
          }));
        }
      });
    } catch (error) {
      console.error('Error rendering education section:', error);
    }

    return elements;
  }

  private renderProjectsSection(projects: any[], styles: any, fieldMappings: any[]): Paragraph[] {
    const elements: Paragraph[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      projects.forEach((project, index) => {
        // Project Name and Role
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: project.name || '',
              bold: true,
              size: (baseStyles.baseFontSize || 12) * 2,
              color: this.parseColor(baseStyles.primaryColor || '#1f2937')
            }),
            new TextRun({
              text: project.role ? ` (${project.role})` : '',
              size: (baseStyles.baseFontSize || 12) * 2
            })
          ],
          spacing: { before: 120, after: 60 }
        }));

        // Date Range
        if (project.start_date || project.end_date) {
          const dateRange = this.formatDateRange(project.start_date, project.end_date, false);
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: dateRange,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Description
        if (project.description) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: project.description,
                size: (baseStyles.baseFontSize || 12) * 2
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Technologies
        if (project.technologies_used && project.technologies_used.length > 0) {
          const techText = Array.isArray(project.technologies_used) 
            ? project.technologies_used.join(', ')
            : project.technologies_used;
          
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: `Technologies: ${techText}`,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280')
              })
            ],
            spacing: { after: 120 }
          }));
        }
      });
    } catch (error) {
      console.error('Error rendering projects section:', error);
    }

    return elements;
  }

  private renderSkillsSection(skills: any[], title: string, styles: any): Paragraph[] {
    const elements: Paragraph[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      if (skills.length === 0) return elements;

      const skillTexts = skills.map(skill => {
        const proficiency = skill.proficiency ? ` (${skill.proficiency}/10)` : '';
        return `${skill.name}${proficiency}`;
      });

      elements.push(new Paragraph({
        children: [
          new TextRun({
            text: skillTexts.join(' • '),
            size: (baseStyles.baseFontSize || 12) * 2
          })
        ],
        spacing: { after: 120 }
      }));
    } catch (error) {
      console.error('Error rendering skills section:', error);
    }

    return elements;
  }

  private renderTrainingSection(trainings: any[], styles: any, fieldMappings: any[]): Paragraph[] {
    const elements: Paragraph[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      trainings.forEach((training, index) => {
        // Training Title and Provider
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: training.title || '',
              bold: true,
              size: (baseStyles.baseFontSize || 12) * 2,
              color: this.parseColor(baseStyles.primaryColor || '#1f2937')
            }),
            new TextRun({
              text: training.provider ? ` - ${training.provider}` : '',
              size: (baseStyles.baseFontSize || 12) * 2
            })
          ],
          spacing: { before: 120, after: 60 }
        }));

        // Certification Date
        if (training.certification_date) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: new Date(training.certification_date).toLocaleDateString(),
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Description
        if (training.description) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: training.description,
                size: (baseStyles.baseFontSize || 12) * 2
              })
            ],
            spacing: { after: 120 }
          }));
        }
      });
    } catch (error) {
      console.error('Error rendering training section:', error);
    }

    return elements;
  }

  private renderAchievementsSection(achievements: any[], styles: any, fieldMappings: any[]): Paragraph[] {
    const elements: Paragraph[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      achievements.forEach((achievement, index) => {
        // Achievement Title
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: achievement.title || '',
              bold: true,
              size: (baseStyles.baseFontSize || 12) * 2,
              color: this.parseColor(baseStyles.primaryColor || '#1f2937')
            })
          ],
          spacing: { before: 120, after: 60 }
        }));

        // Date
        if (achievement.date) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: new Date(achievement.date).toLocaleDateString(),
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Description
        if (achievement.description) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: achievement.description,
                size: (baseStyles.baseFontSize || 12) * 2
              })
            ],
            spacing: { after: 120 }
          }));
        }
      });
    } catch (error) {
      console.error('Error rendering achievements section:', error);
    }

    return elements;
  }

  private getSectionData(profile: any, sectionType: string): any {
    switch (sectionType) {
      case 'general':
        return profile;
      case 'experience':
        return profile.experiences || [];
      case 'education':
        return profile.education || [];
      case 'projects':
        return profile.projects || [];
      case 'technical_skills':
        return profile.technical_skills || [];
      case 'specialized_skills':
        return profile.specialized_skills || [];
      case 'training':
        return profile.trainings || [];
      case 'achievements':
        return profile.achievements || [];
      default:
        return null;
    }
  }

  private getSectionTitle(section: any, fieldMappings: any[]): string {
    const titleMapping = fieldMappings.find(
      mapping => mapping.original_field_name === 'section_title' && mapping.section_type === section.section_type
    );
    
    const defaultTitles = {
      general: 'General Information',
      experience: 'Work Experience',
      education: 'Education',
      projects: 'Projects',
      technical_skills: 'Technical Skills',
      specialized_skills: 'Specialized Skills',
      training: 'Training & Certifications',
      achievements: 'Achievements'
    };

    return titleMapping?.display_name || defaultTitles[section.section_type as keyof typeof defaultTitles] || section.section_type;
  }

  private formatDateRange(startDate: string, endDate: string, isCurrent: boolean): string {
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

  private parseColor(color: string): string {
    if (!color) return '000000';
    // Remove # if present and return hex color for DOCX
    return color.replace('#', '');
  }
}
