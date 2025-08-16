
import React from 'react';
import { CVRenderer } from '@/components/admin/cv-templates/CVRenderer';
import { renderToString } from 'react-dom/server';
import { analyzeAndInsertPageBreaks } from './content-analyzer';

export const generateFullCVHTML = (processedHTML: string, mode: 'fullscreen' | 'download' = 'fullscreen'): string => {
  const baseStyles = `
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      line-height: 1.6; 
      background: #f5f5f5;
    }
    
    /* Page break styles for PDF generation */
    .html2pdf__page-break {
      page-break-before: always;
      page-break-after: avoid;
      break-before: page;
      display: block;
      height: 0;
      margin: 0;
      padding: 0;
      border: none;
    }
    
    /* Prevent breaks inside these elements */
    .no-break,
    .contact-info,
    .summary,
    .experience-item,
    .education-item,
    .project-item,
    .skill-group {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Section headers should not be orphaned */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
      break-after: avoid;
      orphans: 3;
      widows: 3;
    }
    
    /* Major sections */
    .cv-section {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Allow breaks before major sections if needed */
    .cv-section:not(:first-child) {
      page-break-before: auto;
      break-before: auto;
    }
    
    /* Paragraph and text handling */
    p {
      orphans: 2;
      widows: 2;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* List handling */
    ul, ol {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    li {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    @media print {
      body { 
        background: white; 
        padding: 0; 
        font-size: 12pt;
        line-height: 1.4;
      }
      
      .cv-container {
        box-shadow: none !important;
        transform: none !important;
        margin: 0 !important;
        max-width: none !important;
        width: 100% !important;
      }
      
      /* Ensure proper margins for print */
      .cv-content {
        margin: 0;
        padding: 15mm;
      }
      
      /* Hide page break divs in print preview */
      .html2pdf__page-break {
        display: none;
      }
    }
  `;

  // Analyze content and insert page breaks for download mode
  let finalHTML = processedHTML;
  if (mode === 'download') {
    finalHTML = analyzeAndInsertPageBreaks(processedHTML);
  }

  // Generate the CV content using CVRenderer
  const cvContent = renderToString(
    React.createElement(CVRenderer, {
      processedHTML: finalHTML,
      mode
    })
  );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CV Preview</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${baseStyles}</style>
      </head>
      <body>
        ${cvContent}
      </body>
    </html>
  `;
};
