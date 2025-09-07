
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';
import { Loader2, TrendingUp, ChevronDown, ChevronRight, Expand, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpreadsheetPivotTableProps {
  data: PivotStatistics;
  isLoading: boolean;
}

export const SpreadsheetPivotTable: React.FC<SpreadsheetPivotTableProps> = ({ data, isLoading }) => {
  // State for collapse/expand functionality
  const [collapsedRowGroups, setCollapsedRowGroups] = useState<Set<string>>(new Set());
  const [collapsedColGroups, setCollapsedColGroups] = useState<Set<string>>(new Set());

  // Toggle functions
  const toggleRowGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedRowGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedRowGroups(newCollapsed);
  };

  const toggleColGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedColGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedColGroups(newCollapsed);
  };

  const expandAllRowGroups = () => setCollapsedRowGroups(new Set());
  const collapseAllRowGroups = () => {
    if (data.grouping?.info.row_groups) {
      setCollapsedRowGroups(new Set(data.grouping.info.row_groups));
    }
  };

  const expandAllColGroups = () => setCollapsedColGroups(new Set());
  const collapseAllColGroups = () => {
    if (data.grouping?.info.col_groups) {
      setCollapsedColGroups(new Set(data.grouping.info.col_groups));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading pivot data...</p>
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
            <p className="text-sm font-medium">No data available</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting the dimension filters or check your data source
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if grouping is enabled
  const isGroupingEnabled = data.grouping?.enabled || false;
  
  // Memoized calculations for better performance
  const { 
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
  } = useMemo(() => {
    // Transform pivot data into a matrix
    const allRows = data.row_totals?.map(item => item.dimension) || 
                      [...new Set(data.pivot_data.map(item => item.row_dimension))];
    const allCols = data.col_totals?.map(item => item.dimension) ||
                      [...new Set(data.pivot_data.map(item => item.col_dimension))];

    // Group data by parent groups if grouping is enabled
    const rowGroups = isGroupingEnabled && data.grouping?.info.row_groups 
      ? data.grouping.info.row_groups.reduce((acc, group) => {
          const items = data.row_totals?.filter(item => item.group_name === group) || [];
          if (items.length > 0) {
            acc[group] = items.map(item => item.dimension);
          }
          return acc;
        }, {} as Record<string, string[]>)
      : null;

    const colGroups = isGroupingEnabled && data.grouping?.info.col_groups
      ? data.grouping.info.col_groups.reduce((acc, group) => {
          const items = data.col_totals?.filter(item => item.group_name === group) || [];
          if (items.length > 0) {
            acc[group] = items.map(item => item.dimension);
          }
          return acc;
        }, {} as Record<string, string[]>)
      : null;

    // Calculate visible columns based on collapsed state
    const visibleColumns = colGroups 
      ? allCols.filter(col => {
          const group = data.col_totals?.find(item => item.dimension === col)?.group_name;
          return !group || !collapsedColGroups.has(group);
        })
      : allCols;

    // Create lookup maps
    const dataLookup = new Map<string, number>();
    data.pivot_data.forEach(item => {
      dataLookup.set(`${item.row_dimension}|${item.col_dimension}`, item.count);
    });

    const rowTotals = new Map<string, number>();
    data.row_totals?.forEach(item => {
      rowTotals.set(item.dimension, item.total);
    });

    const colTotals = new Map<string, number>();
    data.col_totals?.forEach(item => {
      colTotals.set(item.dimension, item.total);
    });

    // Calculate aggregated totals for collapsed groups
    const aggRowTotals = new Map<string, number>();
    const aggColTotals = new Map<string, number>();
    const aggCellValues = new Map<string, number>();

    if (rowGroups) {
      Object.entries(rowGroups).forEach(([groupName, rows]) => {
        if (collapsedRowGroups.has(groupName)) {
          const groupTotal = rows.reduce((sum, row) => sum + (rowTotals.get(row) || 0), 0);
          aggRowTotals.set(groupName, groupTotal);
        }
      });
    }

    if (colGroups) {
      Object.entries(colGroups).forEach(([groupName, cols]) => {
        if (collapsedColGroups.has(groupName)) {
          const groupTotal = cols.reduce((sum, col) => sum + (colTotals.get(col) || 0), 0);
          aggColTotals.set(groupName, groupTotal);
        }
      });
    }

    // Calculate aggregated cell values for collapsed groups
    if (rowGroups && colGroups) {
      Object.entries(rowGroups).forEach(([rowGroupName, rows]) => {
        Object.entries(colGroups).forEach(([colGroupName, cols]) => {
          if (collapsedRowGroups.has(rowGroupName) && collapsedColGroups.has(colGroupName)) {
            let cellSum = 0;
            rows.forEach(row => {
              cols.forEach(col => {
                cellSum += dataLookup.get(`${row}|${col}`) || 0;
              });
            });
            aggCellValues.set(`${rowGroupName}|${colGroupName}`, cellSum);
          }
        });
      });
    }

    return {
      uniqueRows: allRows,
      uniqueCols: allCols,
      visibleCols: visibleColumns,
      groupedRows: rowGroups,
      groupedCols: colGroups,
      dataMap: dataLookup,
      rowTotalsMap: rowTotals,
      colTotalsMap: colTotals,
      aggregatedRowTotals: aggRowTotals,
      aggregatedColTotals: aggColTotals,
      aggregatedCellValues: aggCellValues
    };
  }, [data, collapsedRowGroups, collapsedColGroups, isGroupingEnabled]);


  const getDimensionLabel = (dimension: string) => {
    const labels: Record<string, string> = {
      'sbu': 'SBU',
      'resource_type': 'Resource Type',
      'bill_type': 'Bill Type',
      'expertise': 'Expertise Type',
    };
    return labels[dimension] || dimension.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getIntensityClass = (value: number, maxValue: number) => {
    if (value === 0) return 'bg-background';
    const intensity = value / maxValue;
    if (intensity > 0.7) return 'bg-primary/20 text-primary';
    if (intensity > 0.4) return 'bg-primary/10 text-primary';
    if (intensity > 0.2) return 'bg-primary/5';
    return 'bg-background';
  };

  // Calculate max value for intensity coloring including aggregated values
  const maxValue = Math.max(
    ...data.pivot_data.map(item => item.count),
    ...Array.from(aggregatedCellValues.values())
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Summary Bar */}
      <div className="flex-shrink-0 px-6 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground">
              Showing <span className="font-medium">{uniqueRows.length}</span> rows × <span className="font-medium">{visibleCols.length}</span> columns
            </span>
            <span className="text-muted-foreground">
              Total: <span className="font-bold text-foreground">{data.grand_total}</span> resources
            </span>
            {isGroupingEnabled && (groupedRows || groupedCols) && (
              <div className="flex items-center gap-2">
                {groupedRows && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={expandAllRowGroups}
                      className="h-6 px-2 text-xs"
                    >
                      <Expand className="h-3 w-3 mr-1" />
                      Expand Rows
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={collapseAllRowGroups}
                      className="h-6 px-2 text-xs"
                    >
                      <Minimize className="h-3 w-3 mr-1" />
                      Collapse Rows
                    </Button>
                  </div>
                )}
                {groupedCols && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={expandAllColGroups}
                      className="h-6 px-2 text-xs"
                    >
                      <Expand className="h-3 w-3 mr-1" />
                      Expand Cols
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={collapseAllColGroups}
                      className="h-6 px-2 text-xs"
                    >
                      <Minimize className="h-3 w-3 mr-1" />
                      Collapse Cols
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Rows: {getDimensionLabel(data.dimensions.primary)} | Columns: {getDimensionLabel(data.dimensions.secondary)}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0">
          <div className="p-6">
            <div className="rounded-lg border bg-card overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  {/* Render grouped headers if grouping is enabled */}
                  {isGroupingEnabled && groupedCols && (
                    <TableRow className="border-b bg-muted/30">
                      <TableHead className="sticky left-0 z-20 bg-muted border-r-2"></TableHead>
                      {Object.entries(groupedCols).map(([groupName, cols]) => {
                        const isCollapsed = collapsedColGroups.has(groupName);
                        const visibleColsInGroup = isCollapsed ? 1 : cols.length;
                        return (
                          <TableHead 
                            key={groupName} 
                            colSpan={visibleColsInGroup} 
                            className="text-center font-bold bg-primary/10 border-r-2 cursor-pointer hover:bg-primary/15 transition-colors"
                            onClick={() => toggleColGroup(groupName)}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <span>{groupName}</span>
                              {isCollapsed && (
                                <span className="text-xs opacity-70">({cols.length})</span>
                              )}
                            </div>
                          </TableHead>
                        );
                      })}
                      <TableHead className="sticky right-0 z-10 bg-muted border-l-2"></TableHead>
                    </TableRow>
                  )}
                  <TableRow className="border-b-2 bg-muted/50">
                    <TableHead className="sticky left-0 z-20 bg-muted border-r-2 font-semibold min-w-40 max-w-48">
                      <div className="flex items-center gap-2">
                        <span>{getDimensionLabel(data.dimensions.primary)}</span>
                      </div>
                    </TableHead>
                    {visibleCols.map(col => (
                      <TableHead key={col} className="text-center font-medium border-r min-w-16 max-w-32 ">
                        <div className="truncate font-semibold" title={col}>
                          {col}
                        </div>
                      </TableHead>
                    ))}
                    {/* Render collapsed column group headers */}
                    {isGroupingEnabled && groupedCols && 
                      Object.entries(groupedCols).map(([groupName, cols]) => {
                        if (collapsedColGroups.has(groupName)) {
                          return (
                            <TableHead 
                              key={`collapsed-${groupName}`} 
                              className="text-center font-medium border-r min-w-16 max-w-32 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                              onClick={() => toggleColGroup(groupName)}
                            >
                              <div className="truncate font-semibold flex items-center justify-center gap-1" title={`${groupName} (${cols.length} items)`}>
                                <ChevronRight className="h-3 w-3" />
                                {groupName}
                              </div>
                            </TableHead>
                          );
                        }
                        return null;
                      })
                    }
                    <TableHead className="text-center font-bold bg-muted border-l-2 min-w-20 sticky right-0 z-10">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isGroupingEnabled && groupedRows ? (
                    // Render grouped rows
                    Object.entries(groupedRows).map(([groupName, rows]) => {
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
                    })
                  ) : (
                    // Render flat rows
                    uniqueRows.map((row, index) => (
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
                    ))
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
              </Table>
            </div>
          </div>
      </div>
    </div>
  );
};
