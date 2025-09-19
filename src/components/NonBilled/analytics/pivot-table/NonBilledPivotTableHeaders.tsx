import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NonBilledPivotStatistics } from '@/hooks/use-non-billed-pivot-statistics';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NonBilledPivotTableHeadersProps {
  data: NonBilledPivotStatistics;
  isGroupingEnabled: boolean;
  groupedCols: Record<string, string[]> | null;
  visibleCols: string[];
  collapsedColGroups: Set<string>;
  toggleColGroup: (groupName: string) => void;
}

export const NonBilledPivotTableHeaders: React.FC<NonBilledPivotTableHeadersProps> = ({
  data,
  isGroupingEnabled,
  groupedCols,
  visibleCols,
  collapsedColGroups,
  toggleColGroup
}) => {
  return (
    <TableHeader>
      <TableRow className="border-b-2">
        <TableHead className="sticky left-0 z-20 bg-card border-r-2 font-bold text-center min-w-40 max-w-48">
          {data.dimensions.primary.toUpperCase()} \ {data.dimensions.secondary.toUpperCase()}
        </TableHead>
        
        {/* Visible Columns */}
        {visibleCols.map(col => (
          <TableHead key={col} className="text-center font-bold bg-primary/5 border-r min-w-24">
            <div className="truncate" title={col}>
              {col}
            </div>
          </TableHead>
        ))}
        
        {/* Collapsed Column Groups */}
        {isGroupingEnabled && groupedCols && 
          Object.entries(groupedCols).map(([colGroupName, cols]) => {
            if (collapsedColGroups.has(colGroupName)) {
              return (
                <TableHead key={`collapsed-${colGroupName}`} className="text-center font-bold bg-primary/10 border-r min-w-24">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleColGroup(colGroupName)}
                    className="h-6 px-2 text-xs font-bold hover:bg-primary/20"
                  >
                    <ChevronRight className="w-3 h-3 mr-1" />
                    {colGroupName} ({cols.length})
                  </Button>
                </TableHead>
              );
            }
            return null;
          })
        }
        
        <TableHead className="text-center font-bold bg-primary/10 border-l-2 sticky right-0 z-20 bg-card">
          TOTAL
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};