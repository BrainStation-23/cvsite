
import React, { useState } from 'react';
import { CompactPivotControls } from './CompactPivotControls';
import { SpreadsheetPivotTable } from './SpreadsheetPivotTable';
import { useResourcePivotStatistics } from '@/hooks/use-resource-pivot-statistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table2 } from 'lucide-react';

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
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Table2 className="h-5 w-5" />
          Cross-Dimensional Resource Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <CompactPivotControls
          primaryDimension={primaryDimension}
          secondaryDimension={secondaryDimension}
          onPrimaryDimensionChange={handlePrimaryDimensionChange}
          onSecondaryDimensionChange={handleSecondaryDimensionChange}
        />
        
        <div className="p-4">
          {pivotData && (
            <SpreadsheetPivotTable
              data={pivotData}
              isLoading={isLoading}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
