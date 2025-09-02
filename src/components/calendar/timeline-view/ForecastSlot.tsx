
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ForecastSlotProps {
  month: Date;
  resourceId: string;
  onCreateForecast: (startDate: Date, resourceId: string) => void;
  isEmpty: boolean;
  slotIndex: number;
}

export const ForecastSlot: React.FC<ForecastSlotProps> = ({
  month,
  resourceId,
  onCreateForecast,
  isEmpty,
  slotIndex,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const dropId = `forecast-slot-${resourceId}-${month.toISOString()}-${slotIndex}`;
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: {
      type: 'forecast-slot',
      month,
      resourceId,
      slotIndex,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`absolute transition-all duration-200 rounded border-2 border-dashed ${
        isOver ? 'bg-primary/20 border-primary' : 'border-muted-foreground/20'
      } ${
        isHovered ? 'bg-primary/10 border-primary/60' : ''
      } ${
        isEmpty ? 'cursor-pointer hover:border-primary/80' : 'cursor-default'
      }`}
      style={{
        top: `${slotIndex * 30}px`,
        left: '4px',
        right: '4px',
        height: '24px',
        zIndex: 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => isEmpty && onCreateForecast(month, resourceId)}
    >
      {isEmpty && (isHovered || isOver) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground rounded px-2 py-1 flex items-center gap-1 text-xs shadow-sm">
            <Plus className="h-3 w-3" />
            <span className="font-medium">
              Add forecast for {format(month, 'MMM yyyy')}
            </span>
          </div>
        </div>
      )}
      {!isEmpty && (isHovered || isOver) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-muted/90 text-muted-foreground rounded px-2 py-1 flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            <span>Drop to create forecast</span>
          </div>
        </div>
      )}
      {isEmpty && !isHovered && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
