import React from 'react';
import { Button } from '@/components/ui/button';
import { Expand, Minimize } from 'lucide-react';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';
import { getDimensionLabel } from '@/lib/pivotTableUtils';

interface PivotTableSummaryProps {
  data: PivotStatistics;
  uniqueRowsLength: number;
  visibleColsLength: number;
  isGroupingEnabled: boolean;
  groupedRows: Record<string, string[]> | null;
  groupedCols: Record<string, string[]> | null;
  expandAllRowGroups: () => void;
  collapseAllRowGroups: () => void;
  expandAllColGroups: () => void;
  collapseAllColGroups: () => void;
}

export const PivotTableSummary: React.FC<PivotTableSummaryProps> = ({
  data,
  uniqueRowsLength,
  visibleColsLength,
  isGroupingEnabled,
  groupedRows,
  groupedCols,
  expandAllRowGroups,
  collapseAllRowGroups,
  expandAllColGroups,
  collapseAllColGroups
}) => {
  return (
    <div className="flex-shrink-0 px-6 py-3 border-b bg-muted/30">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground">
            Showing <span className="font-medium">{uniqueRowsLength}</span> rows × <span className="font-medium">{visibleColsLength}</span> columns
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
  );
};