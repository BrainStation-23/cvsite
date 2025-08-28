
import React from 'react';
import { CVRenderer } from '@/components/admin/cv-templates/CVRenderer';
import { renderToString } from 'react-dom/server';

export const generateFullCVHTML = (processedHTML: string, mode: 'fullscreen' | 'download' = 'fullscreen'): string => {
  const baseStyles = `
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      line-height: 1.6; 
      background: #f5f5f5;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      background: #fff;
      border: 1px solid #ccc;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-family: Arial, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .print-button:hover {
      background: #f5f5f5;
    }
    .print-icon {
      width: 16px;
      height: 16px;
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
      .print-button {
        display: none !important;
      }
    }
  `;

  const printButtonHTML = mode === 'fullscreen' ? `
    <button class="print-button" onclick="printCV()">
      <svg class="print-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6,9 6,2 18,2 18,9"></polyline>
        <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      Print
    </button>
  ` : '';

  const printScript = mode === 'fullscreen' ? `
    <script>
      function printCV() {
        window.print();
      }
      
      // Add keyboard shortcut support
      document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          e.preventDefault();
          printCV();
        }
      });
    </script>
  ` : '';

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
        ${printButtonHTML}
        ${cvContent}
        ${printScript}
      </body>
    </html>
  `;
};
