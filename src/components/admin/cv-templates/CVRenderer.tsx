
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
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      background: 'white',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      padding: '20mm',
      boxSizing: 'border-box' as const
    };

    // Adjust styles based on mode
    if (mode === 'preview') {
      return {
        ...baseStyles,
        transform: 'scale(0.8)',
        transformOrigin: 'top center',
        marginBottom: '40px'
      };
    }

    return baseStyles;
  };

  return (
    <div 
      style={getContainerStyles()}
      dangerouslySetInnerHTML={{ __html: processedHTML }}
    />
  );
};
