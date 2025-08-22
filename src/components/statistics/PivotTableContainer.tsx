
import React, { useState } from 'react';
import { CompactPivotControls } from './CompactPivotControls';
import { SpreadsheetPivotTable } from './SpreadsheetPivotTable';
import { PivotTableFilters } from './PivotTableFilters';
import { useResourcePivotStatistics } from '@/hooks/use-resource-pivot-statistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table2, BarChart3 } from 'lucide-react';

interface PivotTableContainerProps {
  filters: {
    resourceType?: string | null;
    billType?: string | null;
    expertiseType?: string | null;
    sbu?: string | null;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export const PivotTableContainer: React.FC<PivotTableContainerProps> = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}) => {
  const [primaryDimension, setPrimaryDimension] = useState('sbu');
  const [secondaryDimension, setSecondaryDimension] = useState('bill_type');

  const { data: pivotData, isLoading } = useResourcePivotStatistics(
    primaryDimension,
    secondaryDimension,
    filters
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
      {/* Filters Section */}
      <div className="flex-shrink-0">
        <PivotTableFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
      </div>

      {/* Header Section */}
      <div className="flex-shrink-0">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg">
                <Table2 className="h-5 w-5 text-primary" />
                Cross-Dimensional Resource Analysis
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                {pivotData && (
                  <span className="font-medium">
                    {pivotData.grand_total} Total Resources
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CompactPivotControls
              primaryDimension={primaryDimension}
              secondaryDimension={secondaryDimension}
              onPrimaryDimensionChange={handlePrimaryDimensionChange}
              onSecondaryDimensionChange={handleSecondaryDimensionChange}
            />
          </CardContent>
        </Card>
      </div>

      {/* Table Section - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <Card className="h-full flex flex-col">
          <CardContent className="flex-1 p-0 min-h-0">
            {pivotData ? (
              <SpreadsheetPivotTable
                data={pivotData}
                isLoading={isLoading}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-96">
                <div className="text-center space-y-2">
                  <Table2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground">Loading pivot analysis...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
