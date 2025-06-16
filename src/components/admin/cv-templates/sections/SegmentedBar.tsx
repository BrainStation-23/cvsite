import React from 'react';

interface SegmentedBarProps {
  value: number;
  max?: number;
  filledColor?: string;
  emptyColor?: string;
  height?: number | string;
  segmentGap?: number;
  className?: string;
}

/**
 * SegmentedBar renders a horizontal bar divided into segments, visually representing a score out of max.
 * Example: value=7, max=10 => 7 filled, 3 empty segments.
 */
export const SegmentedBar: React.FC<SegmentedBarProps> = ({
  value,
  max = 10,
  filledColor = '#06b6d4', // Tailwind cyan-500
  emptyColor = '#e5e7eb',  // Tailwind gray-200
  height = 10,
  segmentGap = 2,
  className = '',
}) => {
  const segments = Array.from({ length: max });
  return (
    <div style={{ display: 'flex', gap: segmentGap, alignItems: 'center' }} className={className}>
      {segments.map((_, i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: typeof height === 'number' ? `${height}px` : height,
            background: i < value ? filledColor : emptyColor,
            borderRadius: 2,
            transition: 'background 0.2s',
            display: 'block',
          }}
        />
      ))}
    </div>
  );
};
