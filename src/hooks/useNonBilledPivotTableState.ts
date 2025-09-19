import { useState, useMemo } from 'react';
import { NonBilledPivotStatistics, NonBilledMetricType } from '@/hooks/use-non-billed-pivot-statistics';

export const useNonBilledPivotTableState = (data: NonBilledPivotStatistics) => {
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

  // Check if grouping is enabled
  const isGroupingEnabled = data.grouping?.enabled || false;

  // Memoized calculations for better performance
  const calculations = useMemo(() => {
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

    // Create lookup maps for all metrics
    const dataLookup = new Map<string, { count: number; avg_duration: number; initial_count: number; critical_count: number; }>();
    data.pivot_data.forEach(item => {
      dataLookup.set(`${item.row_dimension}|${item.col_dimension}`, {
        count: item.count,
        avg_duration: item.avg_duration,
        initial_count: item.initial_count,
        critical_count: item.critical_count
      });
    });

    const rowTotals = new Map<string, { total: number; avg_duration: number; initial_count: number; critical_count: number; }>();
    data.row_totals?.forEach(item => {
      rowTotals.set(item.dimension, {
        total: item.total,
        avg_duration: item.avg_duration,
        initial_count: item.initial_count,
        critical_count: item.critical_count
      });
    });

    const colTotals = new Map<string, { total: number; avg_duration: number; initial_count: number; critical_count: number; }>();
    data.col_totals?.forEach(item => {
      colTotals.set(item.dimension, {
        total: item.total,
        avg_duration: item.avg_duration,
        initial_count: item.initial_count,
        critical_count: item.critical_count
      });
    });

    // Calculate aggregated totals for collapsed groups
    const aggRowTotals = new Map<string, { total: number; avg_duration: number; initial_count: number; critical_count: number; }>();
    const aggColTotals = new Map<string, { total: number; avg_duration: number; initial_count: number; critical_count: number; }>();
    const aggCellValues = new Map<string, { count: number; avg_duration: number; initial_count: number; critical_count: number; }>();

    if (rowGroups) {
      Object.entries(rowGroups).forEach(([groupName, rows]) => {
        if (collapsedRowGroups.has(groupName)) {
          const rowData = rows.map(row => rowTotals.get(row)).filter(Boolean);
          const groupTotal = rowData.reduce((sum, data) => sum + data!.total, 0);
          const groupAvgDuration = rowData.length > 0 ? rowData.reduce((sum, data) => sum + data!.avg_duration, 0) / rowData.length : 0;
          const groupInitialCount = rowData.reduce((sum, data) => sum + data!.initial_count, 0);
          const groupCriticalCount = rowData.reduce((sum, data) => sum + data!.critical_count, 0);
          
          aggRowTotals.set(groupName, {
            total: groupTotal,
            avg_duration: groupAvgDuration,
            initial_count: groupInitialCount,
            critical_count: groupCriticalCount
          });
        }
      });
    }

    if (colGroups) {
      Object.entries(colGroups).forEach(([groupName, cols]) => {
        if (collapsedColGroups.has(groupName)) {
          const colData = cols.map(col => colTotals.get(col)).filter(Boolean);
          const groupTotal = colData.reduce((sum, data) => sum + data!.total, 0);
          const groupAvgDuration = colData.length > 0 ? colData.reduce((sum, data) => sum + data!.avg_duration, 0) / colData.length : 0;
          const groupInitialCount = colData.reduce((sum, data) => sum + data!.initial_count, 0);
          const groupCriticalCount = colData.reduce((sum, data) => sum + data!.critical_count, 0);
          
          aggColTotals.set(groupName, {
            total: groupTotal,
            avg_duration: groupAvgDuration,
            initial_count: groupInitialCount,
            critical_count: groupCriticalCount
          });
        }
      });
    }

    // Calculate aggregated cell values for collapsed groups
    if (rowGroups && colGroups) {
      Object.entries(rowGroups).forEach(([rowGroupName, rows]) => {
        Object.entries(colGroups).forEach(([colGroupName, cols]) => {
          if (collapsedRowGroups.has(rowGroupName) && collapsedColGroups.has(colGroupName)) {
            let cellCount = 0;
            let cellDurationSum = 0;
            let cellInitialCount = 0;
            let cellCriticalCount = 0;
            let cellsWithDuration = 0;

            rows.forEach(row => {
              cols.forEach(col => {
                const cellData = dataLookup.get(`${row}|${col}`);
                if (cellData) {
                  cellCount += cellData.count;
                  if (cellData.avg_duration > 0) {
                    cellDurationSum += cellData.avg_duration;
                    cellsWithDuration++;
                  }
                  cellInitialCount += cellData.initial_count;
                  cellCriticalCount += cellData.critical_count;
                }
              });
            });

            aggCellValues.set(`${rowGroupName}|${colGroupName}`, {
              count: cellCount,
              avg_duration: cellsWithDuration > 0 ? cellDurationSum / cellsWithDuration : 0,
              initial_count: cellInitialCount,
              critical_count: cellCriticalCount
            });
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

  return {
    collapsedRowGroups,
    collapsedColGroups,
    toggleRowGroup,
    toggleColGroup,
    expandAllRowGroups,
    collapseAllRowGroups,
    expandAllColGroups,
    collapseAllColGroups,
    isGroupingEnabled,
    ...calculations
  };
};