
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
    .cv-container { 
      width: 210mm; 
      min-height: 297mm; 
      margin: 0 auto; 
      background: white; 
      box-shadow: 0 0 10px rgba(0,0,0,0.1); 
      padding: 20mm;
      box-sizing: border-box;
    }
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CV Preview</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="cv-container">${processedHTML}</div>
      </body>
    </html>
  `;
};
