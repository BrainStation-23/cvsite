
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
      background: 'white',
      boxSizing: 'border-box' as const
    };

    // A4 dimensions for consistent sizing across all modes
    const a4Styles = {
      width: '210mm',
      minHeight: '297mm',
      padding: '20mm'
    };

    // Adjust styles based on mode
    if (mode === 'preview') {
      return {
        ...baseStyles,
        ...a4Styles,
        transform: 'scale(0.7)',
        transformOrigin: 'top center',
        margin: '0 auto 40px auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      };
    }

    if (mode === 'fullscreen') {
      return {
        ...baseStyles,
        ...a4Styles,
        margin: '20px auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      };
    }

    // For download mode, maintain A4 size without shadows or margins
    return {
      ...baseStyles,
      ...a4Styles,
      margin: '0'
    };
  };

  return (
    <div 
      style={getContainerStyles()}
      dangerouslySetInnerHTML={{ __html: processedHTML }}
    />
  );
};
