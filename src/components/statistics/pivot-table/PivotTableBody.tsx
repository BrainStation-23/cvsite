import React from 'react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';
import { PivotTableGroupedRows } from './PivotTableGroupedRows';
import { PivotTableFlatRows } from './PivotTableFlatRows';

interface PivotTableBodyProps {
  data: PivotStatistics;
  isGroupingEnabled: boolean;
  groupedRows: Record<string, string[]> | null;
  groupedCols: Record<string, string[]> | null;
  uniqueRows: string[];
  visibleCols: string[];
  collapsedRowGroups: Set<string>;
  collapsedColGroups: Set<string>;
  dataMap: Map<string, number>;
  rowTotalsMap: Map<string, number>;
  colTotalsMap: Map<string, number>;
  aggregatedRowTotals: Map<string, number>;
  aggregatedColTotals: Map<string, number>;
  aggregatedCellValues: Map<string, number>;
  maxValue: number;
  toggleRowGroup: (groupName: string) => void;
}

export const PivotTableBody: React.FC<PivotTableBodyProps> = ({
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
  toggleRowGroup
}) => {
  return (
    <TableBody>
      {isGroupingEnabled && groupedRows ? (
        <PivotTableGroupedRows
          data={data}
          groupedRows={groupedRows}
          groupedCols={groupedCols}
          visibleCols={visibleCols}
          collapsedRowGroups={collapsedRowGroups}
          collapsedColGroups={collapsedColGroups}
          dataMap={dataMap}
          rowTotalsMap={rowTotalsMap}
          aggregatedRowTotals={aggregatedRowTotals}
          aggregatedCellValues={aggregatedCellValues}
          maxValue={maxValue}
          toggleRowGroup={toggleRowGroup}
          isGroupingEnabled={isGroupingEnabled}
        />
      ) : (
        <PivotTableFlatRows
          uniqueRows={uniqueRows}
          visibleCols={visibleCols}
          dataMap={dataMap}
          rowTotalsMap={rowTotalsMap}
          maxValue={maxValue}
          isGroupingEnabled={isGroupingEnabled}
          groupedCols={groupedCols}
          collapsedColGroups={collapsedColGroups}
        />
      )}
      
      {/* Totals row */}
      <TableRow className="border-t-2 bg-primary/5 hover:bg-primary/10 transition-colors">
        <TableCell className="sticky left-0 z-10 bg-muted border-r-2 font-bold">
          Total
        </TableCell>
        {visibleCols.map(col => (
          <TableCell key={col} className="text-center font-bold bg-primary/10 border-r ">
            <div className="font-mono font-bold text-primary">
              {colTotalsMap.get(col) || 0}
            </div>
          </TableCell>
        ))}
        {/* Render collapsed column totals in footer */}
        {isGroupingEnabled && groupedCols && 
          Object.entries(groupedCols).map(([colGroupName, cols]) => {
            if (collapsedColGroups.has(colGroupName)) {
              const value = aggregatedColTotals.get(colGroupName) || 0;
              return (
                <TableCell key={`collapsed-total-${colGroupName}`} className="text-center font-bold bg-primary/10 border-r ">
                  <div className="font-mono font-bold text-primary">
                    {value}
                  </div>
                </TableCell>
              );
            }
            return null;
          })
        }
        <TableCell className="text-center font-bold bg-primary text-primary-foreground border-l-2 sticky right-0 z-10">
          <div className="font-mono font-bold">
            {data.grand_total}
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};