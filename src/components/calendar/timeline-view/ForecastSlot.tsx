
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
        isOver ? 'bg-primary/10 border-primary' : 'border-muted-foreground/30'
      } ${
        isHovered ? 'bg-muted/50 border-primary/50' : ''
      } ${
        isEmpty ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{
        top: `${slotIndex * 30}px`,
        left: '2px',
        right: '2px',
        height: '24px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => isEmpty && onCreateForecast(month, resourceId)}
    >
      {isEmpty && (isHovered || isOver) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary/20 rounded-full px-2 py-1 flex items-center gap-1">
            <Plus className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary font-medium">
              Add forecast for {format(month, 'MMM')}
            </span>
          </div>
        </div>
      )}
      {!isEmpty && (isHovered || isOver) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-muted/80 rounded px-2 py-1 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Drop to create forecast
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
