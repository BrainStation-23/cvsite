import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { getIntensityClass } from '@/lib/pivotTableUtils';

interface PivotTableFlatRowsProps {
  uniqueRows: string[];
  visibleCols: string[];
  dataMap: Map<string, number>;
  rowTotalsMap: Map<string, number>;
  maxValue: number;
  isGroupingEnabled: boolean;
  groupedCols: Record<string, string[]> | null;
  collapsedColGroups: Set<string>;
}

export const PivotTableFlatRows: React.FC<PivotTableFlatRowsProps> = ({
  uniqueRows,
  visibleCols,
  dataMap,
  rowTotalsMap,
  maxValue,
  isGroupingEnabled,
  groupedCols,
  collapsedColGroups
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
            const value = dataMap.get(`${row}|${col}`) || 0;
            return (
              <TableCell key={col} className={`text-center border-r ${getIntensityClass(value, maxValue)}`}>
                <div className="font-mono text-sm font-medium py-1">
                  {value || '—'}
                </div>
              </TableCell>
            );
          })}
          {/* Render collapsed column values for flat rows */}
          {isGroupingEnabled && groupedCols && 
            Object.entries(groupedCols).map(([colGroupName, cols]) => {
              if (collapsedColGroups.has(colGroupName)) {
                const value = cols.reduce((sum, col) => sum + (dataMap.get(`${row}|${col}`) || 0), 0);
                return (
                  <TableCell key={`collapsed-${colGroupName}`} className={`text-center border-r ${getIntensityClass(value, maxValue)}`}>
                    <div className="font-mono text-sm font-medium py-1">
                      {value || '—'}
                    </div>
                  </TableCell>
                );
              }
              return null;
            })
          }
          <TableCell className="text-center font-bold bg-primary/5 border-l-2 sticky right-0 z-10 bg-card">
            <div className="font-mono font-bold text-primary">
              {rowTotalsMap.get(row) || 0}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};