
import React from 'react';

interface CVRendererProps {
  processedHTML: string;
  mode: 'preview' | 'fullscreen' | 'download';
}

export const CVRenderer: React.FC<CVRendererProps> = ({ processedHTML, mode }) => {


  return (
    <div 
      dangerouslySetInnerHTML={{ __html: processedHTML }}
    />
  );
};
