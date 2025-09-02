
import React, { useState, useCallback } from 'react';
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

  // Use useCallback to prevent unnecessary re-renders and improve performance
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    if (isEmpty) {
      onCreateForecast(month, resourceId);
    }
  }, [isEmpty, onCreateForecast, month, resourceId]);

  // Only render if the slot is actually empty
  if (!isEmpty) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={`absolute transition-all duration-200 rounded border-2 border-dashed cursor-pointer ${
        isOver ? 'bg-primary/20 border-primary' : 'border-muted-foreground/20'
      } ${
        isHovered ? 'bg-primary/10 border-primary/60' : ''
      } hover:border-primary/80`}
      style={{
        top: `${slotIndex * 30}px`,
        left: '4px',
        right: '4px',
        height: '24px',
        zIndex: 5, // Lower z-index so projects appear above
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Show add forecast UI when hovered or being dropped on */}
      {(isHovered || isOver) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground rounded px-2 py-1 flex items-center gap-1 text-xs shadow-sm">
            <Plus className="h-3 w-3" />
            <span className="font-medium">
              Add forecast for {format(month, 'MMM yyyy')}
            </span>
          </div>
        </div>
      )}
      
      {/* Show plus icon when not hovered */}
      {!isHovered && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
