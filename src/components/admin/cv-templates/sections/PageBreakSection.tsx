
import React from 'react';

interface PageBreakSectionProps {
  styles?: any;
  sectionConfig?: any;
}

export const PageBreakSection: React.FC<PageBreakSectionProps> = ({ styles }) => {
  return (
    <div 
      style={{
        pageBreakBefore: 'always',
        break: 'page',
        height: '0',
        width: '100%',
        borderTop: '2px dashed #ccc',
        margin: '20px 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <span 
        style={{
          backgroundColor: '#fff',
          padding: '4px 8px',
          fontSize: '10px',
          color: '#666',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      >
        Page Break
      </span>
    </div>
  );
};
