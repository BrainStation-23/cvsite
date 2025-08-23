
import React from 'react';

interface CVRendererProps {
  processedHTML: string;
  mode: 'preview' | 'fullscreen' | 'download';
  pageBreakPreview?: boolean;
}

export const CVRenderer: React.FC<CVRendererProps> = ({ 
  processedHTML, 
  mode, 
  pageBreakPreview = false 
}) => {
  const containerClass = pageBreakPreview 
    ? 'cv-renderer cv-page-break-mode' 
    : 'cv-renderer';

  return (
    <div className={containerClass}>
      {pageBreakPreview && (
        <style jsx>{`
          .cv-page-break-mode {
            /* Apply PDF-specific styles for preview */
            font-size: 12px;
            line-height: 1.4;
          }
          
          .cv-page-break-mode .cv-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
            border: 1px dashed #e0e0e0;
            padding: 10px;
            border-radius: 4px;
          }
          
          .cv-page-break-mode .cv-item {
            page-break-inside: avoid;
            margin-bottom: 15px;
            border-left: 3px solid #f0f0f0;
            padding-left: 10px;
          }
          
          .cv-page-break-mode .cv-section-header {
            page-break-after: avoid;
            page-break-inside: avoid;
            background: #f8f9fa;
            padding: 8px;
            margin: -10px -10px 10px -10px;
            border-radius: 4px 4px 0 0;
          }
          
          .cv-page-break-mode .cv-page-break-before::before {
            content: "📄 Page Break";
            display: block;
            color: #666;
            font-size: 10px;
            text-align: center;
            padding: 5px;
            background: #fff3cd;
            border: 1px dashed #ffeaa7;
            margin-bottom: 10px;
          }
        `}</style>
      )}
      
      <div 
        dangerouslySetInnerHTML={{ __html: processedHTML }}
      />
    </div>
  );
};
