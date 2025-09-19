import React from 'react';
import { TableBody } from '@/components/ui/table';
import { NonBilledPivotStatistics, NonBilledMetricType } from '@/hooks/use-non-billed-pivot-statistics';
import { NonBilledPivotTableFlatRows } from './NonBilledPivotTableFlatRows';

interface NonBilledPivotTableBodyProps {
  data: NonBilledPivotStatistics;
  isGroupingEnabled: boolean;
  groupedRows: Record<string, string[]> | null;
  groupedCols: Record<string, string[]> | null;
  uniqueRows: string[];
  visibleCols: string[];
  collapsedRowGroups: Set<string>;
  collapsedColGroups: Set<string>;
  dataMap: Map<string, { count: number; avg_duration: number; initial_count: number; critical_count: number; }>;
  rowTotalsMap: Map<string, { total: number; avg_duration: number; initial_count: number; critical_count: number; }>;
  colTotalsMap: Map<string, { total: number; avg_duration: number; initial_count: number; critical_count: number; }>;
  aggregatedRowTotals: Map<string, { total: number; avg_duration: number; initial_count: number; critical_count: number; }>;
  aggregatedColTotals: Map<string, { total: number; avg_duration: number; initial_count: number; critical_count: number; }>;
  aggregatedCellValues: Map<string, { count: number; avg_duration: number; initial_count: number; critical_count: number; }>;
  maxValue: number;
  primaryMetric: NonBilledMetricType;
  displayMode: 'compact' | 'expanded';
  toggleRowGroup: (groupName: string) => void;
}

export const NonBilledPivotTableBody: React.FC<NonBilledPivotTableBodyProps> = ({
  data,
  isGroupingEnabled,
  groupedRows,
  groupedCols,
  uniqueRows,
  visibleCols,
  collapsedRowGroups,
  collapsedColGroups,
  dataMap,
  rowTotalsMap,
  colTotalsMap,
  aggregatedRowTotals,
  aggregatedColTotals,
  aggregatedCellValues,
  maxValue,
  primaryMetric,
  displayMode,
  toggleRowGroup
}) => {
  return (
    <TableBody>
      {/* For now, we'll use flat rows - grouped rows can be implemented later if needed */}
      <NonBilledPivotTableFlatRows
        data={data}
        uniqueRows={uniqueRows}
        visibleCols={visibleCols}
        dataMap={dataMap}
        rowTotalsMap={rowTotalsMap}
        maxValue={maxValue}
        primaryMetric={primaryMetric}
        displayMode={displayMode}
        isGroupingEnabled={isGroupingEnabled}
        groupedCols={groupedCols}
        collapsedColGroups={collapsedColGroups}
        aggregatedCellValues={aggregatedCellValues}
      />
    </TableBody>
  );
};