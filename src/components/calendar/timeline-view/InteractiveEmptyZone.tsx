
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

interface InteractiveEmptyZoneProps {
  month: Date;
  resourceId: string;
  zoneType: 'above' | 'below';
  zoneIndex: number;
  onCreateEngagement: (startDate: Date, resourceId: string) => void;
}

export const InteractiveEmptyZone: React.FC<InteractiveEmptyZoneProps> = ({
  month,
  resourceId,
  zoneType,
  zoneIndex,
  onCreateEngagement,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const dropId = `empty-zone-${resourceId}-${month.toISOString()}-${zoneType}-${zoneIndex}`;
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: {
      type: 'empty-zone',
      month,
      resourceId,
      zoneType,
      zoneIndex,
    },
  });

  const topPosition = zoneType === 'above' ? `${zoneIndex * 35}px` : `${(zoneIndex + 1) * 35}px`;

  return (
    <div
      ref={setNodeRef}
      className={`absolute left-0 right-0 transition-all duration-200 cursor-pointer z-10 ${
        isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : ''
      } ${
        isHovered ? 'bg-muted/20' : ''
      }`}
      style={{
        top: topPosition,
        height: '20px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onCreateEngagement(month, resourceId);
      }}
      role="button"
      tabIndex={0}
      aria-label={`Add new engagement for ${month.toLocaleDateString()}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCreateEngagement(month, resourceId);
        }
      }}
    >
      {(isHovered || isOver) && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="bg-primary/80 text-primary-foreground rounded-full p-1 shadow-md z-50">
            <Plus className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  );
};
