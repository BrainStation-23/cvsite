import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ResourceStatusBadgeProps {
  engagementPercent: number;
}

export const ResourceStatusBadge: React.FC<ResourceStatusBadgeProps> = ({
  engagementPercent
}) => {
  if (engagementPercent === 0) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Available
      </Badge>
    );
  } else if (engagementPercent >= 100) {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        Fully Engaged
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Partially Engaged
      </Badge>
    );
  }
};
