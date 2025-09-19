import React from 'react';
import { Table } from '@/components/ui/table';
import { NonBilledPivotStatistics, NonBilledMetricType } from '@/hooks/use-non-billed-pivot-statistics';
import { Loader2, TrendingUp } from 'lucide-react';
import { useNonBilledPivotTableState } from '@/hooks/useNonBilledPivotTableState';
import { NonBilledPivotTableSummary } from './pivot-table/NonBilledPivotTableSummary';
import { NonBilledPivotTableHeaders } from './pivot-table/NonBilledPivotTableHeaders';
import { NonBilledPivotTableBody } from './pivot-table/NonBilledPivotTableBody';

interface NonBilledSpreadsheetPivotTableProps {
  data: NonBilledPivotStatistics;
  isLoading: boolean;
  primaryMetric: NonBilledMetricType;
  displayMode: 'compact' | 'expanded';
}

export const NonBilledSpreadsheetPivotTable: React.FC<NonBilledSpreadsheetPivotTableProps> = ({ 
  data, 
  isLoading, 
  primaryMetric, 
  displayMode 
}) => {
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
  } = useNonBilledPivotTableState(data);

  // Calculate max value based on primary metric
  const maxValue = React.useMemo(() => {
    const getMetricValue = (item: { count: number; avg_duration: number; initial_count: number; critical_count: number; }) => {
      switch (primaryMetric) {
        case 'count': return item.count;
        case 'avg_duration': return item.avg_duration;
        case 'initial_count': return item.initial_count;
        case 'critical_count': return item.critical_count;
      }
    };

    const dataValues = Array.from(dataMap.values()).map(getMetricValue);
    const aggregatedValues = Array.from(aggregatedCellValues.values()).map(getMetricValue);
    
    return Math.max(...dataValues, ...aggregatedValues, 1);
  }, [dataMap, aggregatedCellValues, primaryMetric]);

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
      <NonBilledPivotTableSummary
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
              <NonBilledPivotTableHeaders
                data={data}
                isGroupingEnabled={isGroupingEnabled}
                groupedCols={groupedCols}
                visibleCols={visibleCols}
                collapsedColGroups={collapsedColGroups}
                toggleColGroup={toggleColGroup}
              />
              <NonBilledPivotTableBody
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
                primaryMetric={primaryMetric}
                displayMode={displayMode}
                toggleRowGroup={toggleRowGroup}
              />
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};