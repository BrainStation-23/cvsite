import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { NonBilledPivotStatistics, NonBilledMetricType } from '@/hooks/use-non-billed-pivot-statistics';
import { NonBilledPivotCell } from './NonBilledPivotCell';

interface NonBilledPivotTableFlatRowsProps {
  data: NonBilledPivotStatistics;
  uniqueRows: string[];
  visibleCols: string[];
  dataMap: Map<string, { count: number; avg_duration: number; initial_count: number; critical_count: number; }>;
  rowTotalsMap: Map<string, { total: number; avg_duration: number; initial_count: number; critical_count: number; }>;
  maxValue: number;
  primaryMetric: NonBilledMetricType;
  displayMode: 'compact' | 'expanded';
  isGroupingEnabled: boolean;
  groupedCols: Record<string, string[]> | null;
  collapsedColGroups: Set<string>;
  aggregatedCellValues: Map<string, { count: number; avg_duration: number; initial_count: number; critical_count: number; }>;
}

export const NonBilledPivotTableFlatRows: React.FC<NonBilledPivotTableFlatRowsProps> = ({
  data,
  uniqueRows,
  visibleCols,
  dataMap,
  rowTotalsMap,
  maxValue,
  primaryMetric,
  displayMode,
  isGroupingEnabled,
  groupedCols,
  collapsedColGroups,
  aggregatedCellValues
}) => {
  return (
    <>
      {uniqueRows.map((row, index) => (
        <TableRow key={row} className="hover:bg-muted/30 transition-colors">
          <TableCell className="sticky left-0 z-10 bg-card border-r-2 font-medium min-w-40 max-w-48">
            <div className="truncate font-medium" title={row}>
              {row}
            </div>
          </TableCell>
          {visibleCols.map(col => {
            const cellData = dataMap.get(`${row}|${col}`) || { count: 0, avg_duration: 0, initial_count: 0, critical_count: 0 };
            return (
              <TableCell key={col} className="text-center border-r">
                <NonBilledPivotCell
                  count={cellData.count}
                  avgDuration={cellData.avg_duration}
                  initialCount={cellData.initial_count}
                  criticalCount={cellData.critical_count}
                  primaryMetric={primaryMetric}
                  displayMode={displayMode}
                  maxValue={maxValue}
                />
              </TableCell>
            );
          })}
          {/* Render collapsed column values for flat rows */}
          {isGroupingEnabled && groupedCols && 
            Object.entries(groupedCols).map(([colGroupName, cols]) => {
              if (collapsedColGroups.has(colGroupName)) {
                const cellData = aggregatedCellValues.get(`${row}|${colGroupName}`) || { count: 0, avg_duration: 0, initial_count: 0, critical_count: 0 };
                return (
                  <TableCell key={`collapsed-${colGroupName}`} className="text-center border-r">
                    <NonBilledPivotCell
                      count={cellData.count}
                      avgDuration={cellData.avg_duration}
                      initialCount={cellData.initial_count}
                      criticalCount={cellData.critical_count}
                      primaryMetric={primaryMetric}
                      displayMode={displayMode}
                      maxValue={maxValue}
                    />
                  </TableCell>
                );
              }
              return null;
            })
          }
          <TableCell className="text-center font-bold bg-primary/5 border-l-2 sticky right-0 z-10 bg-card">
            {rowTotalsMap.get(row) && (
              <NonBilledPivotCell
                count={rowTotalsMap.get(row)!.total}
                avgDuration={rowTotalsMap.get(row)!.avg_duration}
                initialCount={rowTotalsMap.get(row)!.initial_count}
                criticalCount={rowTotalsMap.get(row)!.critical_count}
                primaryMetric={primaryMetric}
                displayMode={displayMode}
                maxValue={maxValue}
                className="font-bold text-primary"
              />
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};