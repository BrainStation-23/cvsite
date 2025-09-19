import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NonBilledPivotStatistics } from '@/hooks/use-non-billed-pivot-statistics';
import { ChevronDown, ChevronUp, Table2, TrendingUp, Clock, AlertTriangle, Users } from 'lucide-react';

interface NonBilledPivotTableSummaryProps {
  data: NonBilledPivotStatistics;
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

export const NonBilledPivotTableSummary: React.FC<NonBilledPivotTableSummaryProps> = ({
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
  const { grand_total, dimensions } = data;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Summary Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-primary" />
              <div className="text-sm">
                <span className="font-medium">{uniqueRowsLength}</span>
                <span className="text-muted-foreground ml-1">rows</span>
              </div>
              <div className="text-muted-foreground">×</div>
              <div className="text-sm">
                <span className="font-medium">{visibleColsLength}</span>
                <span className="text-muted-foreground ml-1">columns</span>
              </div>
            </div>

            <div className="h-4 w-px bg-border" />
            
            {/* Grand Total Metrics */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-500" />
                <span className="text-sm font-medium">{grand_total.count}</span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-orange-500" />
                <span className="text-sm font-medium">{grand_total.avg_duration.toFixed(1)}d</span>
                <span className="text-xs text-muted-foreground">avg</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-sm font-medium">{grand_total.initial_count}</span>
                <span className="text-xs text-muted-foreground">initial</span>
              </div>
              {grand_total.critical_count > 0 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-sm font-medium text-red-600">{grand_total.critical_count}</span>
                  <span className="text-xs text-muted-foreground">critical</span>
                </div>
              )}
            </div>
          </div>

          {/* Grouping Controls */}
          {isGroupingEnabled && (groupedRows || groupedCols) && (
            <div className="flex items-center gap-2">
              {groupedRows && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Rows:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={expandAllRowGroups}
                    className="h-6 px-2 text-xs"
                  >
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Expand
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={collapseAllRowGroups}
                    className="h-6 px-2 text-xs"
                  >
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Collapse
                  </Button>
                </div>
              )}
              
              {groupedCols && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Cols:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={expandAllColGroups}
                    className="h-6 px-2 text-xs"
                  >
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Expand
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={collapseAllColGroups}
                    className="h-6 px-2 text-xs"
                  >
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Collapse
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};