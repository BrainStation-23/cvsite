
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
      boxSizing: 'border-box' as const
    };

    // Adjust styles based on mode
    if (mode === 'preview') {
      return {
        ...baseStyles,
        transformOrigin: 'top center',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      };
    }

    if (mode === 'fullscreen') {
      return {
        ...baseStyles,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      };
    }

    // For download mode, no shadow or scaling
    return baseStyles;
  };

  return (
    <div 
      style={getContainerStyles()}
      dangerouslySetInnerHTML={{ __html: processedHTML }}
    />
  );
};
