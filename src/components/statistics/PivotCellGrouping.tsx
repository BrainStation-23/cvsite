
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Group, Ungroup } from 'lucide-react';

interface CellGroup {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  value: string | number;
}

interface PivotCellGroupingProps {
  selectedCells: Set<string>;
  onCreateGroup: (group: CellGroup) => void;
  onRemoveGroup: (groupId: string) => void;
  groups: CellGroup[];
}

export const PivotCellGrouping: React.FC<PivotCellGroupingProps> = ({
  selectedCells,
  onCreateGroup,
  onRemoveGroup,
  groups
}) => {
  const handleGroupCells = () => {
    if (selectedCells.size < 2) return;

    // Parse selected cells to get row/col indices
    const cells = Array.from(selectedCells).map(cellKey => {
      const [row, col] = cellKey.split('-').map(Number);
      return { row, col };
    });

    // Find boundaries
    const minRow = Math.min(...cells.map(c => c.row));
    const maxRow = Math.max(...cells.map(c => c.row));
    const minCol = Math.min(...cells.map(c => c.col));
    const maxCol = Math.max(...cells.map(c => c.col));

    // Create new group
    const newGroup: CellGroup = {
      startRow: minRow,
      endRow: maxRow,
      startCol: minCol,
      endCol: maxCol,
      value: `Group ${groups.length + 1}`
    };

    onCreateGroup(newGroup);
  };

  const canGroup = selectedCells.size >= 2;

  return (
    <div className="flex gap-2 p-2 border-b border-border">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGroup}
            className="flex items-center gap-1"
          >
            <Group className="h-3 w-3" />
            Group Cells
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Group Selected Cells</h4>
              <p className="text-xs text-muted-foreground">
                Selected {selectedCells.size} cells. Groups will be visually merged with a border.
              </p>
            </div>
            <Button
              onClick={handleGroupCells}
              disabled={!canGroup}
              className="w-full"
              size="sm"
            >
              Create Group
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {groups.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemoveGroup('all')}
          className="flex items-center gap-1"
        >
          <Ungroup className="h-3 w-3" />
          Clear Groups ({groups.length})
        </Button>
      )}
    </div>
  );
};
