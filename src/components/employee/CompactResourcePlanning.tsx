
import React from 'react';
import { CompactResourcePlanningEnhanced } from './CompactResourcePlanningEnhanced';
import { ResourcePlanningInfo } from '@/hooks/types/employee-profiles';

interface CompactResourcePlanningProps {
  resourcePlanning?: ResourcePlanningInfo;
  className?: string;
}

export const CompactResourcePlanning: React.FC<CompactResourcePlanningProps> = ({
  resourcePlanning,
  className = ''
}) => {
  // Use the enhanced version which handles both new cumulative data and legacy fields
  return (
    <CompactResourcePlanningEnhanced 
      resourcePlanning={resourcePlanning}
      className={className}
    />
  );
};
