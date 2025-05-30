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

      // Skip section title for general section (personal info goes at top without header)
      if (section.section_type !== 'general') {
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
      }

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

  private async renderGeneralSection(profile: any, styles: any): Promise<Paragraph[]> {
    const elements: Paragraph[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      // Profile Image (if available)
      if (profile.profile_image) {
        try {
          // Fetch the image and convert to buffer
          const response = await fetch(profile.profile_image);
          const imageBuffer = await response.arrayBuffer();
          
          elements.push(new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 100,
                  height: 100,
                },
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }));
        } catch (imageError) {
          console.error('Error loading profile image:', imageError);
          // Continue without image if it fails to load
        }
      }

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

      // Job Title/Designation
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
          spacing: { after: 120 }
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

      // Biography/Summary
      if (profile.biography || profile.summary) {
        const bioText = profile.biography || profile.summary;
        const richTextElements = this.parseRichText(bioText, baseStyles);
        
        elements.push(new Paragraph({
          children: richTextElements,
          spacing: { after: 240 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
    } catch (error) {
      console.error('Error rendering general section:', error);
    }

    return elements;
  }

  // Helper method to parse rich text content
  private parseRichText(htmlContent: string, baseStyles: any): TextRun[] {
    if (!htmlContent) return [];
    
    const fontSize = (baseStyles.baseFontSize || 12) * 2;
    
    // Simple HTML parsing for basic formatting
    // This is a basic implementation - for production, consider using a proper HTML parser
    let text = htmlContent;
    const runs: TextRun[] = [];
    
    // Remove HTML tags and extract text with basic formatting
    // This is a simplified approach - strip HTML but preserve line breaks
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove all other HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    
    // Split by line breaks and create text runs
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (line.trim()) {
        runs.push(new TextRun({
          text: line.trim(),
          size: fontSize
        }));
        if (index < lines.length - 1) {
          runs.push(new TextRun({
            text: '\n',
            size: fontSize
          }));
        }
      }
    });
    
    return runs.length > 0 ? runs : [new TextRun({ text: text, size: fontSize })];
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
              text: exp.designation || exp.job_title || '',
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

        // Description with rich text parsing
        if (exp.description) {
          const richTextElements = this.parseRichText(exp.description, baseStyles);
          elements.push(new Paragraph({
            children: richTextElements,
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

      // Create a properly formatted table for skills
      const skillRows: TableRow[] = [];
      
      // Group skills into rows of 2-3 skills each for better formatting
      const skillsPerRow = 2;
      for (let i = 0; i < skills.length; i += skillsPerRow) {
        const rowSkills = skills.slice(i, i + skillsPerRow);
        
        const cells: TableCell[] = rowSkills.map(skill => {
          const skillText = skill.proficiency 
            ? `${skill.name} (${skill.proficiency}/10)` 
            : skill.name;
          
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: skillText,
                    size: (baseStyles.baseFontSize || 12) * 2
                  })
                ],
                spacing: { before: 60, after: 60 }
              })
            ],
            width: {
              size: 50,
              type: WidthType.PERCENTAGE
            }
          });
        });
        
        // Fill remaining cells if needed
        while (cells.length < skillsPerRow) {
          cells.push(new TableCell({
            children: [new Paragraph({ children: [] })],
            width: {
              size: 50,
              type: WidthType.PERCENTAGE
            }
          }));
        }
        
        skillRows.push(new TableRow({
          children: cells
        }));
      }

      if (skillRows.length > 0) {
        elements.push(new Table({
          rows: skillRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          }
        }));
      }
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
