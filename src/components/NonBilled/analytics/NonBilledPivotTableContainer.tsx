import React, { useState } from 'react';
import { NonBilledPivotControls } from './NonBilledPivotControls';
import { NonBilledSpreadsheetPivotTable } from './NonBilledSpreadsheetPivotTable';
import { useNonBilledPivotStatistics } from '@/hooks/use-non-billed-pivot-statistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table2, BarChart3 } from 'lucide-react';

interface NonBilledPivotTableContainerProps {
  startDate?: Date | null;
  endDate?: Date | null;
}

export const NonBilledPivotTableContainer: React.FC<NonBilledPivotTableContainerProps> = ({ 
  startDate,
  endDate
}) => {
  const [primaryDimension, setPrimaryDimension] = useState('sbu');
  const [secondaryDimension, setSecondaryDimension] = useState('bill_type');
  const [enableGrouping, setEnableGrouping] = useState(true);

  const { data: pivotData, isLoading } = useNonBilledPivotStatistics(
    primaryDimension,
    secondaryDimension,
    {
      startDate,
      endDate,
    },
    enableGrouping
  );

  const handlePrimaryDimensionChange = (dimension: string) => {
    setPrimaryDimension(dimension);
    if (dimension === secondaryDimension) {
      setSecondaryDimension(primaryDimension);
    }
  };

  const handleSecondaryDimensionChange = (dimension: string) => {
    setSecondaryDimension(dimension);
    if (dimension === primaryDimension) {
      setPrimaryDimension(secondaryDimension);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex-shrink-0">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg">
                <Table2 className="h-5 w-5 text-primary" />
                Non-Billed Cross-Dimensional Analysis
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                {pivotData && (
                  <span className="font-medium">
                    {pivotData.grand_total} Total Non-Billed Resources
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
              <NonBilledPivotControls
                primaryDimension={primaryDimension}
                secondaryDimension={secondaryDimension}
                onPrimaryDimensionChange={handlePrimaryDimensionChange}
                onSecondaryDimensionChange={handleSecondaryDimensionChange}
                enableGrouping={enableGrouping}
                onEnableGroupingChange={setEnableGrouping}
              />
          </CardContent>
        </Card>
      </div>

      {/* Table Section - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <Card className="h-full flex flex-col">
          <CardContent className="flex-1 p-0 min-h-0">
            {pivotData ? (
              <NonBilledSpreadsheetPivotTable
                data={pivotData}
                isLoading={isLoading}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-96">
                <div className="text-center space-y-2">
                  <Table2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground">Loading non-billed pivot analysis...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};