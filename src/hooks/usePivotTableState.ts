import { useState, useMemo } from 'react';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';

export const usePivotTableState = (data: PivotStatistics) => {
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

  // Calculate max value for intensity coloring including aggregated values
  const maxValue = Math.max(
    ...data.pivot_data.map(item => item.count),
    ...Array.from(calculations.aggregatedCellValues.values())
  );

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
    maxValue,
    ...calculations
  };
};