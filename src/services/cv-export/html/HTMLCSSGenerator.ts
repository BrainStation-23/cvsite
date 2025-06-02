
export class HTMLCSSGenerator {
  generateCSS(layoutConfig: any, orientation: string): string {
    const pageWidth = orientation === 'portrait' ? '210mm' : '297mm';
    const pageHeight = orientation === 'portrait' ? '297mm' : '210mm';
    const primaryColor = layoutConfig.primaryColor || '#1f2937';
    const secondaryColor = layoutConfig.secondaryColor || '#6b7280';
    const accentColor = layoutConfig.accentColor || '#3b82f6';
    const primaryFont = layoutConfig.primaryFont || 'Arial';
    const baseFontSize = layoutConfig.baseFontSize || 12;
    const lineHeight = layoutConfig.lineHeight || 1.4;
    const margin = layoutConfig.margin || 20;
    const sectionSpacing = layoutConfig.sectionSpacing || 16;
    const itemSpacing = layoutConfig.itemSpacing || 8;

    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${primaryFont}, sans-serif;
            font-size: ${baseFontSize}pt;
            line-height: ${lineHeight};
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        
        .cv-container {
            max-width: ${pageWidth};
            width: 100%;
            margin: 0 auto;
            background: white;
            padding: ${margin}mm;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            min-height: ${pageHeight};
        }
        
        .cv-page {
            min-height: calc(${pageHeight} - ${margin * 2}mm);
            page-break-after: always;
            break-after: page;
            padding-bottom: 20pt;
        }
        
        .cv-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
        }
        
        .header {
            text-align: ${layoutConfig.layoutType === 'single-column' ? 'center' : 'left'};
            margin-bottom: ${sectionSpacing}pt;
            border-bottom: 2px solid ${primaryColor};
            padding-bottom: 10pt;
            display: flex;
            align-items: flex-start;
            gap: 20pt;
        }
        
        .header-content {
            flex: 1;
        }
        
        .profile-image {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            object-fit: cover;
            border: 3px solid ${primaryColor};
            flex-shrink: 0;
        }
        
        .name {
            font-size: ${layoutConfig.headingSize || 24}pt;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 5pt;
        }
        
        .title {
            font-size: ${layoutConfig.subheadingSize || 16}pt;
            color: ${secondaryColor};
            margin-bottom: 5pt;
        }
        
        .contact-info {
            color: ${secondaryColor};
            font-size: ${baseFontSize - 1}pt;
            margin-bottom: 10pt;
        }
        
        .contact-info span {
            margin-right: 15px;
        }
        
        .biography {
            text-align: justify;
            color: #333;
            margin-top: 10pt;
            line-height: 1.5;
        }
        
        .section {
            margin-bottom: ${sectionSpacing}pt;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .section-title {
            font-size: ${layoutConfig.subheadingSize || 16}pt;
            font-weight: bold;
            color: ${primaryColor};
            border-bottom: 2px solid ${accentColor};
            padding-bottom: 3pt;
            margin-bottom: ${itemSpacing}pt;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }
        
        .section-content {
            margin-left: 0;
        }
        
        .item {
            margin-bottom: ${itemSpacing}pt;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 3pt;
        }
        
        .item-title {
            font-weight: bold;
            color: ${primaryColor};
            font-size: ${baseFontSize + 1}pt;
        }
        
        .item-subtitle {
            color: ${secondaryColor};
            font-style: italic;
            margin-bottom: 2pt;
        }
        
        .item-date {
            color: ${secondaryColor};
            font-size: ${baseFontSize - 1}pt;
            white-space: nowrap;
        }
        
        .item-description {
            color: #333;
            margin-top: 3pt;
            text-align: justify;
            line-height: 1.5;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10pt;
        }
        
        .skill-category {
            margin-bottom: 10pt;
        }
        
        .skill-category-title {
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 5pt;
            font-size: ${baseFontSize}pt;
        }
        
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 5pt;
        }
        
        .skill-tag {
            background-color: ${accentColor};
            color: white;
            padding: 3pt 8pt;
            border-radius: 12pt;
            font-size: ${baseFontSize - 2}pt;
            white-space: nowrap;
        }
        
        .technologies {
            margin-top: 5pt;
        }
        
        .technologies-label {
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 3pt;
        }
        
        .tech-list {
            display: flex;
            flex-wrap: wrap;
            gap: 3pt;
        }
        
        .tech-tag {
            background-color: #f3f4f6;
            color: #374151;
            padding: 2pt 6pt;
            border-radius: 8pt;
            font-size: ${baseFontSize - 2}pt;
            border: 1px solid #d1d5db;
        }
        
        .project-url {
            margin-top: 5pt;
            color: ${accentColor};
            text-decoration: none;
            font-weight: 500;
        }
        
        .project-url:hover {
            text-decoration: underline;
        }
        
        .education-details {
            margin-top: 3pt;
        }
        
        .gpa-info {
            color: ${secondaryColor};
            font-size: ${baseFontSize - 1}pt;
            margin-top: 2pt;
        }
        
        /* Page break styles */
        .page-break {
            page-break-before: always;
            break-before: page;
            height: 0;
            margin: 0;
            padding: 0;
            border: none;
        }
        
        .page-break-explicit {
            page-break-before: always;
            break-before: page;
            height: 0;
            margin: 0;
            padding: 0;
            border: none;
        }
        
        /* Screen preview styles for page breaks */
        @media screen {
            .cv-container {
                padding: 0;
                border-radius: 0;
                box-shadow: none;
                background: #e5e7eb;
                max-width: none;
            }
            
            .cv-page {
                background: white;
                margin-bottom: 20px;
                padding: ${margin}mm;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                page-break-after: auto;
                break-after: auto;
            }
            
            .page-break,
            .page-break-explicit {
                display: none;
            }
        }
        
        /* Print styles */
        @media print {
            body {
                background-color: white;
                padding: 0;
                margin: 0;
            }
            
            .cv-container {
                box-shadow: none;
                border-radius: 0;
                max-width: none;
                width: 100%;
                margin: 0;
                padding: 0;
                background: white;
            }
            
            .cv-page {
                padding: ${margin}mm;
                margin: 0;
                border-radius: 0;
                box-shadow: none;
                min-height: calc(${pageHeight} - ${margin * 2}mm);
            }
            
            .page-break,
            .page-break-explicit {
                page-break-before: always;
                break-before: page;
                height: 0;
                margin: 0;
                padding: 0;
                border: none;
            }
        }
        
        @page {
            size: ${orientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
            margin: 0;
        }
    `;
  }
}
