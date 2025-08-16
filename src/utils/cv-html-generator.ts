
import React from 'react';
import { CVRenderer } from '@/components/admin/cv-templates/CVRenderer';
import { renderToString } from 'react-dom/server';

export const generateFullCVHTML = (processedHTML: string, mode: 'fullscreen' | 'download' = 'fullscreen'): string => {
  const baseStyles = `
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 20px; 
      line-height: 1.6; 
      background: #f5f5f5;
    }
    @media print {
      body { 
        background: white; 
        padding: 0; 
      }
      .cv-container {
        box-shadow: none !important;
        transform: none !important;
        margin: 0 !important;
      }
    }
  `;

  // Generate the CV content using CVRenderer
  const cvContent = renderToString(
    React.createElement(CVRenderer, {
      processedHTML,
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
