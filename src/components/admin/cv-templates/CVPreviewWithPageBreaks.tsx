
import React, { useEffect, useRef, useState } from 'react';
import { CVRenderer } from './CVRenderer';

interface CVPreviewWithPageBreaksProps {
  processedHTML: string;
  mode?: 'preview' | 'fullscreen' | 'download';
  orientation?: 'portrait' | 'landscape';
}

export const CVPreviewWithPageBreaks: React.FC<CVPreviewWithPageBreaksProps> = ({
  processedHTML,
  mode = 'preview',
  orientation = 'portrait'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageElements, setPageElements] = useState<HTMLElement[]>([]);

  // A4 dimensions in pixels (assuming 96 DPI)
  const pageWidth = orientation === 'landscape' ? 1123 : 794; // 297mm : 210mm
  const pageHeight = orientation === 'landscape' ? 794 : 1123; // 210mm : 297mm
  const pageMargin = 57; // 15mm margin

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const content = container.querySelector('.cv-content') as HTMLElement;
    if (!content) return;

    // Create pages based on content height
    const pages: HTMLElement[] = [];
    const availableHeight = pageHeight - (pageMargin * 2);
    
    // Clone the content for manipulation
    const clonedContent = content.cloneNode(true) as HTMLElement;
    let currentPageContent = '';
    let currentHeight = 0;
    let pageNumber = 1;

    // Simple page break simulation - split by sections
    const sections = clonedContent.querySelectorAll('.cv-section, .cv-item, div, p, h1, h2, h3, h4, h5, h6');
    
    sections.forEach((section, index) => {
      const element = section as HTMLElement;
      const elementHeight = estimateElementHeight(element);
      
      // Check if element has page-break-before class
      if (element.classList.contains('cv-page-break-before') && currentPageContent) {
        createPage();
      }
      
      // Check if adding this element would exceed page height
      if (currentHeight + elementHeight > availableHeight && currentPageContent) {
        // Check if element should avoid breaking
        if (element.classList.contains('cv-page-break-avoid') || 
            element.closest('.cv-page-break-avoid')) {
          createPage();
        }
      }
      
      currentPageContent += element.outerHTML;
      currentHeight += elementHeight;
      
      // Check if element has page-break-after class
      if (element.classList.contains('cv-page-break-after')) {
        createPage();
      }
    });

    // Create final page if there's remaining content
    if (currentPageContent) {
      createPage();
    }

    function createPage() {
      const pageElement = document.createElement('div');
      pageElement.className = 'cv-page';
      pageElement.innerHTML = `
        <div class="cv-page-number">Page ${pageNumber}</div>
        <div class="cv-page-content">${currentPageContent}</div>
      `;
      pages.push(pageElement);
      
      currentPageContent = '';
      currentHeight = 0;
      pageNumber++;
    }

    function estimateElementHeight(element: HTMLElement): number {
      // Simple height estimation based on content
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseInt(computedStyle.fontSize) || 16;
      const lineHeight = parseFloat(computedStyle.lineHeight) || 1.4;
      
      const textContent = element.textContent || '';
      const lines = Math.ceil(textContent.length / 80); // Rough estimate
      
      return lines * (fontSize * lineHeight) + 20; // Add some padding
    }

    setPageElements(pages);
  }, [processedHTML, pageHeight, pageMargin, orientation]);

  return (
    <div className="cv-page-break-preview">
      <style jsx>{`
        .cv-page-break-preview {
          background: #f5f5f5;
          padding: 20px;
          min-height: 100%;
        }
        
        .cv-page {
          width: ${pageWidth}px;
          height: ${pageHeight}px;
          background: white;
          margin: 0 auto 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          page-break-after: always;
        }
        
        .cv-page-number {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 10px;
          color: #666;
          background: rgba(255, 255, 255, 0.9);
          padding: 2px 6px;
          border-radius: 3px;
          z-index: 10;
        }
        
        .cv-page-content {
          padding: ${pageMargin}px;
          height: calc(100% - ${pageMargin * 2}px);
          overflow: hidden;
        }
        
        .cv-page:last-child {
          margin-bottom: 0;
        }
        
        /* Apply PDF-specific styles */
        .cv-page-content .cv-section {
          page-break-inside: avoid;
          margin-bottom: 20px;
        }
        
        .cv-page-content .cv-item {
          page-break-inside: avoid;
          margin-bottom: 15px;
        }
        
        .cv-page-content .cv-section-header {
          page-break-after: avoid;
          page-break-inside: avoid;
        }
        
        .cv-page-content .cv-item-header {
          page-break-after: avoid;
        }
      `}</style>
      
      <div ref={containerRef}>
        <div className="cv-content" style={{ display: 'none' }}>
          <CVRenderer processedHTML={processedHTML} mode={mode} />
        </div>
        
        {pageElements.map((pageElement, index) => (
          <div 
            key={index}
            className="cv-page"
            dangerouslySetInnerHTML={{ __html: pageElement.innerHTML }}
          />
        ))}
      </div>
    </div>
  );
};
