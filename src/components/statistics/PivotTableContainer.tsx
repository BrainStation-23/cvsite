
import React, { useState } from 'react';
import { PivotControls } from './PivotControls';
import { PivotTable } from './PivotTable';
import { useResourcePivotStatistics } from '@/hooks/use-resource-pivot-statistics';

interface PivotTableContainerProps {
  filters: {
    resourceType?: string | null;
    billType?: string | null;
    expertiseType?: string | null;
    sbu?: string | null;
  };
}

export const PivotTableContainer: React.FC<PivotTableContainerProps> = ({ filters }) => {
  const [primaryDimension, setPrimaryDimension] = useState('sbu');
  const [secondaryDimension, setSecondaryDimension] = useState('bill_type');

  const { data: pivotData, isLoading } = useResourcePivotStatistics(
    primaryDimension,
    secondaryDimension,
    filters
  );

  const handlePrimaryDimensionChange = (dimension: string) => {
    setPrimaryDimension(dimension);
    // If the new primary dimension is the same as secondary, swap them
    if (dimension === secondaryDimension) {
      setSecondaryDimension(primaryDimension);
    }
  };

  const handleSecondaryDimensionChange = (dimension: string) => {
    setSecondaryDimension(dimension);
    // If the new secondary dimension is the same as primary, swap them
    if (dimension === primaryDimension) {
      setPrimaryDimension(secondaryDimension);
    }
  };

  return (
    <div className="space-y-6">
      <PivotControls
        primaryDimension={primaryDimension}
        secondaryDimension={secondaryDimension}
        onPrimaryDimensionChange={handlePrimaryDimensionChange}
        onSecondaryDimensionChange={handleSecondaryDimensionChange}
      />
      
      {pivotData && (
        <PivotTable
          data={pivotData}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
