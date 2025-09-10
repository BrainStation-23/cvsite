import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';
import { getDimensionLabel } from '@/lib/pivotTableUtils';

interface PivotTableHeadersProps {
  data: PivotStatistics;
  isGroupingEnabled: boolean;
  groupedCols: Record<string, string[]> | null;
  visibleCols: string[];
  collapsedColGroups: Set<string>;
  toggleColGroup: (groupName: string) => void;
}

export const PivotTableHeaders: React.FC<PivotTableHeadersProps> = ({
  data,
  isGroupingEnabled,
  groupedCols,
  visibleCols,
  collapsedColGroups,
  toggleColGroup
}) => {
  return (
    <TableHeader>
      {/* Grouped header row */}
      {isGroupingEnabled && groupedCols && (
        <TableRow className="border-b bg-muted/30">
          <TableHead className="sticky left-0 z-20 bg-muted border-r-2"></TableHead>
          {Object.entries(groupedCols).map(([groupName, cols]) => {
            const isCollapsed = collapsedColGroups.has(groupName);
            return (
              <TableHead
                key={groupName}
                colSpan={isCollapsed ? 1 : cols.length}
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
      {/* Column header row */}
      <TableRow className="border-b-2 bg-muted/50">
        <TableHead className="sticky left-0 z-20 bg-muted border-r-2 font-semibold min-w-40 max-w-48">
          <div className="flex items-center gap-2">
            <span>{getDimensionLabel(data.dimensions.primary)}</span>
          </div>
        </TableHead>
        {isGroupingEnabled && groupedCols
          ? Object.entries(groupedCols).map(([groupName, cols]) => {
              if (collapsedColGroups.has(groupName)) {
                // Collapsed: render one header cell for the group
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
              } else {
                // Expanded: render each column in the group
                return cols.map(col => (
                  <TableHead key={col} className="text-center font-medium border-r min-w-16 max-w-32 ">
                    <div className="truncate font-semibold" title={col}>
                      {col}
                    </div>
                  </TableHead>
                ));
              }
            })
          : visibleCols.map(col => (
              <TableHead key={col} className="text-center font-medium border-r min-w-16 max-w-32 ">
                <div className="truncate font-semibold" title={col}>
                  {col}
                </div>
              </TableHead>
            ))
        }
        <TableHead className="text-center font-bold bg-muted border-l-2 min-w-20 sticky right-0 z-10">
          Total
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};