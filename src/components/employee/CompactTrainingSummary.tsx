
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CompactTrainingSummaryProps {
  trainings: Array<{
    title: string;
    provider: string;
  }>;
}

export const CompactTrainingSummary: React.FC<CompactTrainingSummaryProps> = ({ trainings }) => {
  if (!trainings || trainings.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {trainings.slice(0, 2).map((training, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {training.title}
        </Badge>
      ))}
      {trainings.length > 2 && (
        <span className="text-xs text-gray-500">+{trainings.length - 2}</span>
      )}
    </div>
  );
};
