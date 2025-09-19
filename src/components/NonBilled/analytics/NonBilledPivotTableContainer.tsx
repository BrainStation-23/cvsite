import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw, Settings } from 'lucide-react';
import { SpreadsheetPivotTable } from '@/components/statistics/SpreadsheetPivotTable';
import { useNonBilledPivotStatistics } from '@/hooks/use-non-billed-analytics';

interface NonBilledPivotTableContainerProps {
  filters: {
    sbuFilter: string | null;
    billTypeFilter: string | null;
    expertiseTypeFilter: string | null;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  startDate?: Date | null;
  endDate?: Date | null;
}

export function NonBilledPivotTableContainer({
  filters,
  onFiltersChange,
  onClearFilters,
  startDate,
  endDate,
}: NonBilledPivotTableContainerProps) {
  const [primaryDimension, setPrimaryDimension] = useState('sbu');
  const [secondaryDimension, setSecondaryDimension] = useState('bill_type');
  const [enableGrouping, setEnableGrouping] = useState(false);

  const { data: pivotData, isLoading } = useNonBilledPivotStatistics(
    primaryDimension,
    secondaryDimension,
    {
      ...filters,
      startDate,
      endDate,
    },
    enableGrouping
  );

  const dimensionOptions = [
    { value: 'sbu', label: 'SBU' },
    { value: 'bill_type', label: 'Bill Type' },
    { value: 'expertise', label: 'Expertise' },
    { value: 'experience_level', label: 'Experience Level' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Controls */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-end">
        {/* Dimension Selection */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Primary Dimension (Rows)</label>
          <Select value={primaryDimension} onValueChange={setPrimaryDimension}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dimensionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Secondary Dimension (Columns)</label>
          <Select value={secondaryDimension} onValueChange={setSecondaryDimension}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dimensionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grouping Toggle */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Grouping</label>
          <Button
            variant={enableGrouping ? "default" : "outline"}
            onClick={() => setEnableGrouping(!enableGrouping)}
            className="w-32"
          >
            <Settings className="h-4 w-4 mr-2" />
            {enableGrouping ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {/* Clear Filters */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium opacity-0">Actions</label>
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-32"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Pivot Table */}
      <div className="border rounded-lg bg-background">
        {pivotData && (
          <SpreadsheetPivotTable
            data={pivotData}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}