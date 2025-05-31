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
      console.log('DOCX Export - Field mappings count:', fieldMappings?.length);
      
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
      
      // Add a test paragraph if no content
      if (documentChildren.length === 0) {
        documentChildren.push(new Paragraph({
          children: [new TextRun("No content available")]
        }));
      }
      
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
          const generalElements = await this.renderGeneralSection(profile, styles, fieldMappings);
          elements.push(...generalElements);
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

  private async renderGeneralSection(profile: any, styles: any, fieldMappings: any[]): Promise<(Paragraph | Table)[]> {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      // Profile Image (if available and not masked)
      const profileImageValue = this.applyFieldMasking(profile.profile_image, 'profile_image', 'general', fieldMappings);
      if (profileImageValue && profileImageValue !== '***') {
        try {
          // Fetch the image and convert to buffer
          const response = await fetch(profileImageValue);
          const imageBuffer = await response.arrayBuffer();
          
          elements.push(new Paragraph({
            children: [
              new ImageRun({
                data: new Uint8Array(imageBuffer),
                transformation: {
                  width: 100,
                  height: 100,
                },
                type: 'jpg'
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
      const firstName = this.applyFieldMasking(profile.first_name, 'first_name', 'general', fieldMappings);
      const lastName = this.applyFieldMasking(profile.last_name, 'last_name', 'general', fieldMappings);
      
      if (firstName || lastName) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: `${firstName || ''} ${lastName || ''}`.trim(),
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
      const designation = this.applyFieldMasking(profile.designation?.name || profile.job_title, 'designation', 'general', fieldMappings);
      if (designation) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: designation,
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
      const email = this.applyFieldMasking(profile.email, 'email', 'general', fieldMappings);
      const phone = this.applyFieldMasking(profile.phone, 'phone', 'general', fieldMappings);
      const location = this.applyFieldMasking(profile.location, 'location', 'general', fieldMappings);
      
      if (email) contactInfo.push(`Email: ${email}`);
      if (phone) contactInfo.push(`Phone: ${phone}`);
      if (location) contactInfo.push(`Location: ${location}`);

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

      // Biography/Summary with rich text parsing and masking
      const biography = this.applyFieldMasking(profile.biography || profile.summary, 'biography', 'general', fieldMappings);
      if (biography) {
        const richTextParagraphs = this.parseRichTextToDocx(biography, baseStyles);
        elements.push(...richTextParagraphs);
      }
    } catch (error) {
      console.error('Error rendering general section:', error);
    }

    return elements;
  }

  // Helper function to apply field masking based on field mappings
  private applyFieldMasking(value: any, fieldName: string, sectionType: string, fieldMappings: any[]): any {
    if (!value || !fieldMappings) return value;
    
    const fieldMapping = fieldMappings.find(
      mapping => mapping.original_field_name === fieldName && mapping.section_type === sectionType
    );
    
    if (!fieldMapping || !fieldMapping.is_masked) return value;
    
    // Apply masking
    if (fieldMapping.mask_value) {
      return fieldMapping.mask_value;
    } else {
      // Default masking
      if (typeof value === 'string' && value.length > 3) {
        return value.substring(0, 3) + '***';
      }
      return '***';
    }
  }

  // Enhanced method to properly parse HTML to DOCX rich text with better list support
  private parseRichTextToDocx(htmlContent: string, baseStyles: any): Paragraph[] {
    if (!htmlContent) return [];
    
    const fontSize = (baseStyles.baseFontSize || 12) * 2;
    const paragraphs: Paragraph[] = [];
    
    // Handle lists specially
    const listRegex = /<(ul|ol)>(.*?)<\/\1>/gis;
    const listMatches = Array.from(htmlContent.matchAll(listRegex));
    
    let lastIndex = 0;
    
    for (const match of listMatches) {
      const [fullMatch, listType, listContent] = match;
      const matchIndex = match.index || 0;
      
      // Process content before the list
      if (matchIndex > lastIndex) {
        const beforeListContent = htmlContent.substring(lastIndex, matchIndex);
        const beforeParagraphs = this.parseRegularContent(beforeListContent, fontSize);
        paragraphs.push(...beforeParagraphs);
      }
      
      // Process the list
      const listParagraphs = this.parseListContent(listContent, listType, fontSize);
      paragraphs.push(...listParagraphs);
      
      lastIndex = matchIndex + fullMatch.length;
    }
    
    // Process remaining content after the last list
    if (lastIndex < htmlContent.length) {
      const remainingContent = htmlContent.substring(lastIndex);
      const remainingParagraphs = this.parseRegularContent(remainingContent, fontSize);
      paragraphs.push(...remainingParagraphs);
    }
    
    // If no lists were found, parse as regular content
    if (listMatches.length === 0) {
      return this.parseRegularContent(htmlContent, fontSize);
    }
    
    return paragraphs;
  }

  // Parse list content with proper bullet points
  private parseListContent(listContent: string, listType: string, fontSize: number): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const listItems = listContent.match(/<li>(.*?)<\/li>/gis) || [];
    
    listItems.forEach((item, index) => {
      const itemContent = item.replace(/<\/?li>/gi, '').trim();
      const textRuns = this.parseHtmlToTextRuns(itemContent, fontSize);
      
      if (textRuns.length > 0) {
        // Add bullet point or number
        const bullet = listType === 'ol' ? `${index + 1}. ` : '• ';
        const bulletRun = new TextRun({ text: bullet, size: fontSize });
        
        paragraphs.push(new Paragraph({
          children: [bulletRun, ...textRuns],
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 360 } // Indent list items
        }));
      }
    });
    
    return paragraphs;
  }

  // Parse regular content (non-list)
  private parseRegularContent(content: string, fontSize: number): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    // Split into paragraphs first
    const htmlParagraphs = content
      .split(/<\/p>/gi)
      .map(p => p.replace(/<p[^>]*>/gi, '').trim())
      .filter(p => p.length > 0);
    
    htmlParagraphs.forEach(paragraphHtml => {
      const textRuns = this.parseHtmlToTextRuns(paragraphHtml, fontSize);
      if (textRuns.length > 0) {
        paragraphs.push(new Paragraph({
          children: textRuns,
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
    });
    
    // If no paragraphs were created, create a single paragraph
    if (paragraphs.length === 0 && content.trim()) {
      const textRuns = this.parseHtmlToTextRuns(content, fontSize);
      if (textRuns.length > 0) {
        paragraphs.push(new Paragraph({
          children: textRuns,
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
    }
    
    return paragraphs;
  }

  // Parse HTML content to TextRuns with formatting
  private parseHtmlToTextRuns(html: string, fontSize: number): TextRun[] {
    const runs: TextRun[] = [];
    
    // Handle line breaks first
    const parts = html.split(/<br\s*\/?>/gi);
    
    parts.forEach((part, partIndex) => {
      if (partIndex > 0) {
        runs.push(new TextRun({ text: '\n', size: fontSize }));
      }
      
      // Process formatting tags
      let currentText = part;
      let currentPos = 0;
      
      // Regular expression to find formatting tags
      const formatRegex = /<(\/?)([^>]+)>/g;
      let match;
      
      const formatStack: Array<{ tag: string; bold?: boolean; italic?: boolean; underline?: boolean }> = [];
      
      while ((match = formatRegex.exec(currentText)) !== null) {
        const [fullMatch, isClosing, tagContent] = match;
        const tagName = tagContent.toLowerCase().split(' ')[0];
        
        // Add text before this tag
        if (match.index > currentPos) {
          const textBefore = currentText.substring(currentPos, match.index);
          if (textBefore.trim()) {
            const currentFormat = this.getCurrentFormat(formatStack);
            runs.push(new TextRun({
              text: textBefore,
              size: fontSize,
              ...currentFormat
            }));
          }
        }
        
        // Handle tag
        if (isClosing === '/') {
          // Remove last matching tag from stack
          for (let i = formatStack.length - 1; i >= 0; i--) {
            if (formatStack[i].tag === tagName) {
              formatStack.splice(i, 1);
              break;
            }
          }
        } else {
          // Add tag to stack
          const formatProps: any = { tag: tagName };
          switch (tagName) {
            case 'strong':
            case 'b':
              formatProps.bold = true;
              break;
            case 'em':
            case 'i':
              formatProps.italic = true;
              break;
            case 'u':
              formatProps.underline = true;
              break;
          }
          formatStack.push(formatProps);
        }
        
        currentPos = match.index + fullMatch.length;
      }
      
      // Add remaining text
      if (currentPos < currentText.length) {
        const remainingText = currentText.substring(currentPos).replace(/<[^>]*>/g, '');
        if (remainingText.trim()) {
          const currentFormat = this.getCurrentFormat(formatStack);
          runs.push(new TextRun({
            text: remainingText,
            size: fontSize,
            ...currentFormat
          }));
        }
      }
      
      // If no formatted content was found, just add the plain text
      if (runs.length === 0 || (partIndex === 0 && currentPos === 0)) {
        const plainText = currentText.replace(/<[^>]*>/g, '').trim();
        if (plainText) {
          runs.push(new TextRun({
            text: plainText,
            size: fontSize
          }));
        }
      }
    });
    
    return runs;
  }

  // Get current formatting from stack
  private getCurrentFormat(formatStack: Array<{ tag: string; bold?: boolean; italic?: boolean; underline?: boolean }>): object {
    const format: any = {};
    
    formatStack.forEach(item => {
      if (item.bold) format.bold = true;
      if (item.italic) format.italics = true;
      if (item.underline) format.underline = true;
    });
    
    return format;
  }

  private renderExperienceSection(experiences: any[], styles: any, fieldMappings: any[]): Paragraph[] {
    const elements: Paragraph[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      experiences.forEach((exp, index) => {
        // Apply masking to each field
        const designation = this.applyFieldMasking(exp.designation || exp.job_title, 'designation', 'experience', fieldMappings);
        const companyName = this.applyFieldMasking(exp.company_name, 'company_name', 'experience', fieldMappings);
        const description = this.applyFieldMasking(exp.description, 'description', 'experience', fieldMappings);

        // Job Title and Company
        if (designation || companyName) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: designation || '',
                bold: true,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.primaryColor || '#1f2937')
              }),
              new TextRun({
                text: companyName ? ` at ${companyName}` : '',
                size: (baseStyles.baseFontSize || 12) * 2
              })
            ],
            spacing: { before: 120, after: 60 }
          }));
        }

        // Date Range
        if (exp.start_date || exp.end_date) {
          const dateRange = this.formatDateRange(exp.start_date, exp.end_date, exp.is_current);
          const maskedDateRange = this.applyFieldMasking(dateRange, 'date_range', 'experience', fieldMappings);
          
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: maskedDateRange,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Description with rich text parsing and masking
        if (description) {
          const richTextParagraphs = this.parseRichTextToDocx(description, baseStyles);
          elements.push(...richTextParagraphs);
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
        // Apply masking to each field
        const degree = this.applyFieldMasking(edu.degree?.name || edu.degree_name, 'degree', 'education', fieldMappings);
        const university = this.applyFieldMasking(edu.university?.name, 'university', 'education', fieldMappings);
        const gpa = this.applyFieldMasking(edu.gpa, 'gpa', 'education', fieldMappings);

        // Degree and Institution
        if (degree || university) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: degree || '',
                bold: true,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.primaryColor || '#1f2937')
              }),
              new TextRun({
                text: university ? ` - ${university}` : '',
                size: (baseStyles.baseFontSize || 12) * 2
              })
            ],
            spacing: { before: 120, after: 60 }
          }));
        }

        // Date Range
        if (edu.start_date || edu.end_date) {
          const dateRange = this.formatDateRange(edu.start_date, edu.end_date, false);
          const maskedDateRange = this.applyFieldMasking(dateRange, 'date_range', 'education', fieldMappings);
          
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: maskedDateRange,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // GPA
        if (gpa) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: `GPA: ${gpa}`,
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
        // Apply masking to each field
        const name = this.applyFieldMasking(project.name, 'name', 'projects', fieldMappings);
        const role = this.applyFieldMasking(project.role, 'role', 'projects', fieldMappings);
        const description = this.applyFieldMasking(project.description, 'description', 'projects', fieldMappings);
        const technologies = this.applyFieldMasking(project.technologies_used, 'technologies_used', 'projects', fieldMappings);

        // Project Name and Role
        if (name || role) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: name || '',
                bold: true,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.primaryColor || '#1f2937')
              }),
              new TextRun({
                text: role ? ` (${role})` : '',
                size: (baseStyles.baseFontSize || 12) * 2
              })
            ],
            spacing: { before: 120, after: 60 }
          }));
        }

        // Date Range
        if (project.start_date || project.end_date) {
          const dateRange = this.formatDateRange(project.start_date, project.end_date, false);
          const maskedDateRange = this.applyFieldMasking(dateRange, 'date_range', 'projects', fieldMappings);
          
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: maskedDateRange,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Description with rich text parsing and masking
        if (description) {
          const richTextParagraphs = this.parseRichTextToDocx(description, baseStyles);
          elements.push(...richTextParagraphs);
        }

        // Technologies
        if (technologies && technologies.length > 0) {
          const techText = Array.isArray(technologies) 
            ? technologies.join(', ')
            : technologies;
          
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

  private renderSkillsSection(skills: any[], title: string, styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      if (skills.length === 0) return elements;

      // Create a properly formatted table for skills
      const skillRows: TableRow[] = [];
      
      // Group skills into rows of 3 skills each for better formatting
      const skillsPerRow = 3;
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
              size: 33.33,
              type: WidthType.PERCENTAGE
            }
          });
        });
        
        // Fill remaining cells if needed
        while (cells.length < skillsPerRow) {
          cells.push(new TableCell({
            children: [new Paragraph({ children: [] })],
            width: {
              size: 33.33,
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
        // Apply masking to each field
        const title = this.applyFieldMasking(training.title, 'title', 'training', fieldMappings);
        const provider = this.applyFieldMasking(training.provider, 'provider', 'training', fieldMappings);
        const description = this.applyFieldMasking(training.description, 'description', 'training', fieldMappings);

        // Training Title and Provider
        if (title || provider) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: title || '',
                bold: true,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.primaryColor || '#1f2937')
              }),
              new TextRun({
                text: provider ? ` - ${provider}` : '',
                size: (baseStyles.baseFontSize || 12) * 2
              })
            ],
            spacing: { before: 120, after: 60 }
          }));
        }

        // Certification Date
        if (training.certification_date) {
          const certDate = this.applyFieldMasking(new Date(training.certification_date).toLocaleDateString(), 'certification_date', 'training', fieldMappings);
          
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: certDate,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Description
        if (description) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: description,
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
        // Apply masking to each field
        const title = this.applyFieldMasking(achievement.title, 'title', 'achievements', fieldMappings);
        const description = this.applyFieldMasking(achievement.description, 'description', 'achievements', fieldMappings);

        // Achievement Title
        if (title) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.primaryColor || '#1f2937')
              })
            ],
            spacing: { before: 120, after: 60 }
          }));
        }

        // Date
        if (achievement.date) {
          const achievementDate = this.applyFieldMasking(new Date(achievement.date).toLocaleDateString(), 'date', 'achievements', fieldMappings);
          
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: achievementDate,
                size: (baseStyles.baseFontSize || 12) * 2,
                color: this.parseColor(baseStyles.secondaryColor || '#6b7280'),
                italics: true
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Description
        if (description) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: description,
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
