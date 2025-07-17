
import React, { useRef, useEffect, useState } from 'react';

interface ContentMeasurerProps {
  content: React.ReactNode;
  onMeasured: (height: number) => void;
}

export const ContentMeasurer: React.FC<ContentMeasurerProps> = ({ content, onMeasured }) => {
  const measureRef = useRef<HTMLDivElement>(null);
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    if (measureRef.current && !isMeasured) {
      const height = measureRef.current.scrollHeight;
      onMeasured(height);
      setIsMeasured(true);
    }
  }, [content, onMeasured, isMeasured]);

  return (
    <div
      ref={measureRef}
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        visibility: 'hidden',
        width: '170mm', // A4 content width minus margins
        fontSize: '12pt',
        lineHeight: 1.4,
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {content}
    </div>
  );
};
