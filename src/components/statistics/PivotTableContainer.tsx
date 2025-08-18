
import React, { useState } from 'react';
import { PivotControls } from './PivotControls';
import { CustomPivotTable } from './CustomPivotTable';
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
    <div className="h-full flex flex-col max-w-full overflow-hidden">
      {/* Controls - Fixed at top */}
      <div className="flex-shrink-0 mb-4">
        <PivotControls
          primaryDimension={primaryDimension}
          secondaryDimension={secondaryDimension}
          onPrimaryDimensionChange={handlePrimaryDimensionChange}
          onSecondaryDimensionChange={handleSecondaryDimensionChange}
        />
      </div>
      
      {/* Table - Scrollable container */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {pivotData && (
          <CustomPivotTable
            data={pivotData}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};
