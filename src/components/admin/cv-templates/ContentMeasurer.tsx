
import React, { useRef, useEffect, useState } from 'react';

interface ContentMeasurerProps {
  children: React.ReactNode;
  onMeasured: (height: number) => void;
}

export const ContentMeasurer: React.FC<ContentMeasurerProps> = ({ children, onMeasured }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    if (containerRef.current && !isMeasured) {
      const height = containerRef.current.offsetHeight;
      onMeasured(height);
      setIsMeasured(true);
    }
  }, [onMeasured, isMeasured]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'absolute',
        top: 0,
        left: '-9999px',
        visibility: 'hidden',
        width: '210mm' // A4 width
      }}
    >
      {children}
    </div>
  );
};
