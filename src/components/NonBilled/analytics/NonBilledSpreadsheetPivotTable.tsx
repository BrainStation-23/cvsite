import React from 'react';
import { Table } from '@/components/ui/table';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';
import { Loader2, TrendingUp } from 'lucide-react';
import { usePivotTableState } from '@/hooks/usePivotTableState';
import { PivotTableSummary } from '../../statistics/pivot-table/PivotTableSummary';
import { PivotTableHeaders } from '../../statistics/pivot-table/PivotTableHeaders';
import { PivotTableBody } from '../../statistics/pivot-table/PivotTableBody';

interface NonBilledSpreadsheetPivotTableProps {
  data: PivotStatistics;
  isLoading: boolean;
}

export const NonBilledSpreadsheetPivotTable: React.FC<NonBilledSpreadsheetPivotTableProps> = ({ data, isLoading }) => {
  const {
    collapsedRowGroups,
    collapsedColGroups,
    toggleRowGroup,
    toggleColGroup,
    expandAllRowGroups,
    collapseAllRowGroups,
    expandAllColGroups,
    collapseAllColGroups,
    isGroupingEnabled,
    maxValue,
    uniqueRows,
    uniqueCols,
    visibleCols,
    groupedRows,
    groupedCols,
    dataMap,
    rowTotalsMap,
    colTotalsMap,
    aggregatedRowTotals,
    aggregatedColTotals,
    aggregatedCellValues
  } = usePivotTableState(data);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading non-billed pivot data...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.pivot_data?.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center space-y-3">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium">No non-billed data available</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting the dimension filters or date range
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <PivotTableSummary
        data={data}
        uniqueRowsLength={uniqueRows.length}
        visibleColsLength={visibleCols.length}
        isGroupingEnabled={isGroupingEnabled}
        groupedRows={groupedRows}
        groupedCols={groupedCols}
        expandAllRowGroups={expandAllRowGroups}
        collapseAllRowGroups={collapseAllRowGroups}
        expandAllColGroups={expandAllColGroups}
        collapseAllColGroups={collapseAllColGroups}
      />

      {/* Table Container */}
      <div className="flex-1 min-h-0">
        <div className="p-6">
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table className="text-sm">
              <PivotTableHeaders
                data={data}
                isGroupingEnabled={isGroupingEnabled}
                groupedCols={groupedCols}
                visibleCols={visibleCols}
                collapsedColGroups={collapsedColGroups}
                toggleColGroup={toggleColGroup}
              />
              <PivotTableBody
                data={data}
                isGroupingEnabled={isGroupingEnabled}
                groupedRows={groupedRows}
                groupedCols={groupedCols}
                uniqueRows={uniqueRows}
                visibleCols={visibleCols}
                collapsedRowGroups={collapsedRowGroups}
                collapsedColGroups={collapsedColGroups}
                dataMap={dataMap}
                rowTotalsMap={rowTotalsMap}
                colTotalsMap={colTotalsMap}
                aggregatedRowTotals={aggregatedRowTotals}
                aggregatedColTotals={aggregatedColTotals}
                aggregatedCellValues={aggregatedCellValues}
                maxValue={maxValue}
                toggleRowGroup={toggleRowGroup}
              />
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};