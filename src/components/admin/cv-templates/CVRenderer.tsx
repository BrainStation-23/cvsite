
import React from 'react';

interface CVRendererProps {
  processedHTML: string;
  mode: 'preview' | 'fullscreen' | 'download';
}

export const CVRenderer: React.FC<CVRendererProps> = ({ processedHTML, mode }) => {
  const getContainerStyles = () => {
    const baseStyles = {
      all: 'unset' as const,
      display: 'block',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#333',
      margin: 'auto',
      background: 'white',
      boxSizing: 'border-box' as const,
      width: '210mm', // A4 width
      minHeight: '297mm', // A4 height
      padding: '15mm'
    };

    // Adjust styles based on mode
    if (mode === 'preview') {
      return {
        ...baseStyles,
        transform: 'scale(0.6)',
        transformOrigin: 'top center',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      };
    }

    if (mode === 'fullscreen') {
      return {
        ...baseStyles,
        transform: 'scale(0.8)',
        transformOrigin: 'top center',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        marginTop: '2rem',
        marginBottom: '2rem'
      };
    }

    // For download mode, no scaling or shadows
    return {
      ...baseStyles,
      width: '100%',
      minHeight: 'auto',
      transform: 'none',
      boxShadow: 'none',
      margin: '0'
    };
  };

  // Add CSS classes to common CV elements for better page break control
  const enhanceHTMLWithClasses = (html: string): string => {
    let enhanced = html;
    
    // Add classes to common patterns for better page break control
    enhanced = enhanced.replace(/<h1([^>]*)>/gi, '<h1$1 class="cv-major-heading">');
    enhanced = enhanced.replace(/<h2([^>]*)>/gi, '<h2$1 class="cv-section-heading">');
    enhanced = enhanced.replace(/<div([^>]*)(experience|education|project)([^>]*)>/gi, '<div$1$2$3 class="$2-item no-break">');
    
    return enhanced;
  };

  const finalHTML = mode === 'download' ? enhanceHTMLWithClasses(processedHTML) : processedHTML;

  return (
    <div 
      className={`cv-container ${mode === 'download' ? 'cv-content' : ''}`}
      style={getContainerStyles()}
      dangerouslySetInnerHTML={{ __html: finalHTML }}
    />
  );
};
