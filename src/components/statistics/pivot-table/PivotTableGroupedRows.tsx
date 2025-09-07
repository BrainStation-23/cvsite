import React from 'react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';
import { getIntensityClass } from '@/lib/pivotTableUtils';

interface PivotTableGroupedRowsProps {
  data: PivotStatistics;
  groupedRows: Record<string, string[]>;
  groupedCols: Record<string, string[]> | null;
  visibleCols: string[];
  collapsedRowGroups: Set<string>;
  collapsedColGroups: Set<string>;
  dataMap: Map<string, number>;
  rowTotalsMap: Map<string, number>;
  aggregatedRowTotals: Map<string, number>;
  aggregatedCellValues: Map<string, number>;
  maxValue: number;
  toggleRowGroup: (groupName: string) => void;
  isGroupingEnabled: boolean;
}

export const PivotTableGroupedRows: React.FC<PivotTableGroupedRowsProps> = ({
  data,
  groupedRows,
  groupedCols,
  visibleCols,
  collapsedRowGroups,
  collapsedColGroups,
  dataMap,
  rowTotalsMap,
  aggregatedRowTotals,
  aggregatedCellValues,
  maxValue,
  toggleRowGroup,
  isGroupingEnabled
}) => {
  return (
    <>
      {Object.entries(groupedRows).map(([groupName, rows]) => {
        const isCollapsed = collapsedRowGroups.has(groupName);
        return (
          <React.Fragment key={groupName}>
            <TableRow className="bg-primary/5 border-t-2 cursor-pointer hover:bg-primary/10 transition-colors">
              <TableCell 
                colSpan={visibleCols.length + 2} 
                className="sticky left-0 z-10 font-bold text-primary bg-primary/10 border-r-2"
                onClick={() => toggleRowGroup(groupName)}
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span>{groupName}</span>
                  {isCollapsed && (
                    <span className="text-xs opacity-70">({rows.length} items)</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
            {isCollapsed ? (
              // Render aggregated row when collapsed
              <TableRow className="hover:bg-muted/30 transition-colors bg-primary/5">
                <TableCell className="sticky left-0 z-10 bg-card border-r-2 font-medium min-w-40 max-w-48 pl-6">
                  <div className="truncate font-medium flex items-center gap-2" title={`${groupName} (aggregated)`}>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                    <span className="italic">{groupName} Total</span>
                  </div>
                </TableCell>
                {visibleCols.map(col => {
                  // Check if this column is also collapsed
                  const colGroup = data.col_totals?.find(item => item.dimension === col)?.group_name;
                  let value = 0;
                  
                  if (colGroup && collapsedColGroups.has(colGroup)) {
                    value = aggregatedCellValues.get(`${groupName}|${colGroup}`) || 0;
                  } else {
                    value = rows.reduce((sum, row) => sum + (dataMap.get(`${row}|${col}`) || 0), 0);
                  }
                  
                  return (
                    <TableCell key={col} className={`text-center border-r ${getIntensityClass(value, maxValue)}`}>
                      <div className="font-mono text-sm font-bold py-1 italic">
                        {value || '—'}
                      </div>
                    </TableCell>
                  );
                })}
                {/* Render collapsed column totals */}
                {isGroupingEnabled && groupedCols && 
                  Object.entries(groupedCols).map(([colGroupName, cols]) => {
                    if (collapsedColGroups.has(colGroupName)) {
                      const value = aggregatedCellValues.get(`${groupName}|${colGroupName}`) || 0;
                      return (
                        <TableCell key={`collapsed-${colGroupName}`} className={`text-center border-r ${getIntensityClass(value, maxValue)}`}>
                          <div className="font-mono text-sm font-bold py-1 italic">
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
                    {aggregatedRowTotals.get(groupName) || 0}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Render individual rows when expanded
              rows.map((row) => (
                <TableRow key={row} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="sticky left-0 z-10 bg-card border-r-2 font-medium min-w-40 max-w-48 pl-6">
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
                  {/* Render collapsed column values for expanded rows */}
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
              ))
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};