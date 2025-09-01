
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

interface InteractiveEmptySpaceProps {
  month: Date;
  resourceId: string;
  onCreateEngagement: (startDate: Date, resourceId: string) => void;
}

export const InteractiveEmptySpace: React.FC<InteractiveEmptySpaceProps> = ({
  month,
  resourceId,
  onCreateEngagement,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const dropId = `empty-${resourceId}-${month.toISOString()}`;
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: {
      type: 'empty-space',
      month,
      resourceId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`absolute inset-0 transition-all duration-200 ${
        isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : ''
      } ${
        isHovered ? 'bg-muted/30' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onCreateEngagement(month, resourceId)}
    >
      {(isHovered || isOver) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary/20 rounded-full p-2">
            <Plus className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
};
