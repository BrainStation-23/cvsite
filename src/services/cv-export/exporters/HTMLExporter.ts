import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { HTMLLayoutRenderer } from '../html/HTMLLayoutRenderer';
import { HTMLPageDistributor } from '../html/HTMLPageDistributor';

export class HTMLExporter extends BaseExporter {
  private layoutRenderer = new HTMLLayoutRenderer();
  private pageDistributor = new HTMLPageDistributor();

  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('=== HTML EXPORT DEBUG START ===');
      console.log('HTML Export - Template:', template.name);
      console.log('HTML Export - Profile structure check:', {
        hasProfile: !!profile,
        profileKeys: profile ? Object.keys(profile) : [],
        profileType: typeof profile,
        isArray: Array.isArray(profile),
        profileData: profile
      });
      
      // Check if profile has the expected structure from get_employee_data
      console.log('HTML Export - Profile field analysis:', {
        // Direct fields that should exist on root
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        email: profile?.email,
        phone: profile?.phone,
        location: profile?.location,
        designation: profile?.designation,
        biography: profile?.biography,
        profileImage: profile?.profile_image,
        
        // Nested arrays that should exist
        technicalSkills: profile?.technical_skills,
        specializedSkills: profile?.specialized_skills,
        experiences: profile?.experiences,
        education: profile?.education,
        projects: profile?.projects,
        trainings: profile?.trainings,
        achievements: profile?.achievements,
        
        // Type checks
        technicalSkillsType: typeof profile?.technical_skills,
        specializedSkillsType: typeof profile?.specialized_skills,
        technicalSkillsLength: Array.isArray(profile?.technical_skills) ? profile.technical_skills.length : 'not array',
        specializedSkillsLength: Array.isArray(profile?.specialized_skills) ? profile.specialized_skills.length : 'not array'
      });
      
      console.log('HTML Export - Sections:', sections?.length || 0);
      console.log('HTML Export - Field mappings:', fieldMappings?.length || 0);
      console.log('HTML Export - Field mappings by section:', 
        fieldMappings?.reduce((acc, fm) => {
          acc[fm.section_type] = (acc[fm.section_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      );
      console.log('HTML Export - Layout config:', template.layout_config);
      
      if (!profile) {
        throw new Error('Profile data is required for HTML export');
      }

      if (!sections || sections.length === 0) {
        throw new Error('At least one section must be configured for HTML export');
      }

      // Generate comprehensive HTML CV using the unified layout system
      const htmlContent = this.generateCompleteHTMLCV(profile, template, sections, fieldMappings, styles);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileName = this.generateFileName(profile, 'html');
      
      this.downloadFile(blob, fileName);
      
      console.log('=== HTML EXPORT DEBUG END ===');
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('HTML export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HTML export failed'
      };
    }
  }

  private generateCompleteHTMLCV(profile: any, template: any, sections: any[], fieldMappings: any[], styles: any): string {
    const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
    const layoutConfig = template.layout_config || {};
    const layoutType = layoutConfig.layoutType || 'single-column';
    const orientation = template.orientation || 'portrait';
    
    // Generate pages using the same logic as the preview - this should include the general section in the layout
    const pages = this.pageDistributor.distributePages(
      sections,
      fieldMappings,
      profile,
      layoutConfig,
      orientation
    );

    // Generate unified CSS using the layout system
    const layoutCSS = this.layoutRenderer.generateLayoutCSS(layoutType, layoutConfig);
    const baseCSS = this.generateBaseCSS(layoutConfig, template.orientation);
    
    // Combine all pages (no separate header needed - general section is included in layout)
    const pagesHTML = pages.join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${fullName}</title>
    <style>
        ${baseCSS}
        ${layoutCSS}
        
        .page-break {
          page-break-before: always;
          break-before: page;
          height: 0;
          margin: 0;
        }
        
        @media screen {
          .page-break {
            border-top: 2px dashed #ccc;
            height: 20px;
            margin: 20px 0;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .page-break::after {
            content: "Page Break";
            background: white;
            padding: 4px 8px;
            font-size: 10px;
            color: #666;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
        }
    </style>
</head>
<body>
    <div class="cv-container">
        ${pagesHTML}
    </div>
</body>
</html>`;
  }

  private generateBaseCSS(layoutConfig: Record<string, any>, orientation: string): string {
    const pageWidth = orientation === 'portrait' ? '210mm' : '297mm';
    const pageHeight = orientation === 'portrait' ? '297mm' : '210mm';
    
    return `
      body {
        margin: 0;
        padding: 20px;
        font-family: ${layoutConfig.primaryFont || 'Arial'}, sans-serif;
        font-size: ${layoutConfig.baseFontSize || 12}pt;
        line-height: ${layoutConfig.lineHeight || 1.4};
        color: #333;
        background-color: #f5f5f5;
      }
      
      .cv-container {
        max-width: ${pageWidth};
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        padding: ${layoutConfig.margin || 20}mm;
      }
      
      .cv-page {
        min-height: calc(${pageHeight} - ${(layoutConfig.margin || 20) * 2}mm);
        page-break-after: always;
      }
      
      .cv-page:last-child {
        page-break-after: avoid;
      }
      
      .section {
        margin-bottom: ${layoutConfig.sectionSpacing || 16}pt;
        break-inside: avoid;
      }
      
      .section-title {
        font-size: ${layoutConfig.subheadingSize || 14}pt;
        font-weight: bold;
        color: inherit;
        border-bottom: 1px solid ${layoutConfig.accentColor || '#3b82f6'};
        padding-bottom: 2pt;
        margin-bottom: ${layoutConfig.itemSpacing || 8}pt;
        margin-top: 0;
      }
      
      .item {
        margin-bottom: ${layoutConfig.itemSpacing || 8}pt;
      }
      
      .item-title {
        font-weight: bold;
        color: inherit;
        margin: 0 0 4pt 0;
      }
      
      .item-subtitle {
        color: ${layoutConfig.secondaryColor || '#6b7280'};
        font-size: 0.9em;
        margin: 0 0 6pt 0;
      }
      
      .item-description {
        margin: 6pt 0;
        line-height: 1.4;
      }
      
      .skills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 5pt;
        margin: 6pt 0;
      }
      
      .skill-tag {
        background-color: ${layoutConfig.accentColor || '#3b82f6'};
        color: white;
        padding: 2pt 6pt;
        border-radius: 3pt;
        font-size: 0.8em;
        display: inline-block;
      }
      
      .technologies {
        margin-top: 8pt;
      }
      
      .project-url {
        margin-top: 6pt;
        font-size: 0.9em;
      }
      
      .project-url a {
        color: ${layoutConfig.accentColor || '#3b82f6'};
        text-decoration: none;
      }
      
      .project-url a:hover {
        text-decoration: underline;
      }
      
      @media print {
        body {
          background: white;
          padding: 0;
        }
        
        .cv-container {
          box-shadow: none;
          margin: 0;
          padding: ${layoutConfig.margin || 20}mm;
        }
        
        .page-break {
          page-break-before: always;
          height: 0;
          margin: 0;
          border: none;
        }
        
        .page-break::after {
          display: none;
        }
      }
    `;
  }
}
