import React from 'react';

interface TimelineItem {
  title: string;
  subtitle?: string;
  dateRange?: string;
  description?: string;
  icon?: React.ReactNode;
}

interface VerticalTimelineProps {
  items: TimelineItem[];
  accentColor?: string;
}

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ items, accentColor = '#3b82f6' }) => {
  return (
    <div style={{ width: '100%' }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 32,
            marginBottom: 8,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Date */}
          <div
            style={{
              minWidth: 110,
              maxWidth: 130,
              textAlign: 'right',
              paddingRight: 24,
              color: '#6b7280',
              fontSize: '0.97em',
              fontStyle: 'italic',
              lineHeight: 1.1,
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {item.dateRange}
          </div>

          {/* Center: Node (with vertical line) */}
          <div
            style={{
              position: 'relative',
              width: 32,
              height: 32, // compact height to match row
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {/* Vertical line (spans the whole timeline except for first and last nodes) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                width: 2,
                background: `linear-gradient(to bottom, ${accentColor}55, ${accentColor}22)`,
                zIndex: 1,
                transform: 'translateX(-50%)',
                borderRadius: 2,
                top: idx === 0 ? 26 : 0,
                bottom: idx === items.length - 1 ? 26 : 0,
                height: idx === 0 ? 26 : idx === items.length - 1 ? 26 : 52,
              }}
            />
            {/* For middle nodes, height: 52 (full row); for first/last, height: 26 (half row) */}
            {/* Node */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                width: 22,
                height: 22,
                background: accentColor,
                borderRadius: '50%',
                border: '4px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 14,
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.12)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.transform = '';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
              }}
            >
              {item.icon}
            </div>
          </div>

          {/* Right: Content */}
          <div style={{ flex: 1, minWidth: 0, paddingLeft: 24 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.05em', marginBottom: 2, wordBreak: 'break-word' }}>{item.title}</div>
            {item.subtitle && (
              <div style={{ color: '#6b7280', fontSize: '0.95em', marginBottom: 2, wordBreak: 'break-word' }}>{item.subtitle}</div>
            )}
            {item.description && (
              <div
                style={{ fontSize: '0.95em', lineHeight: 1.5, color: '#444', marginTop: 4, wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
