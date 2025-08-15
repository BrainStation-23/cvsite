
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Table } from 'lucide-react';

interface ViewToggleProps {
  showCharts: boolean;
  showTables: boolean;
  onToggleCharts: () => void;
  onToggleTables: () => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  showCharts,
  showTables,
  onToggleCharts,
  onToggleTables
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">View:</span>
      <Button
        variant={showCharts ? "default" : "outline"}
        size="sm"
        onClick={onToggleCharts}
        className="flex items-center gap-2"
      >
        <BarChart3 className="h-4 w-4" />
        Charts
      </Button>
      <Button
        variant={showTables ? "default" : "outline"}
        size="sm"
        onClick={onToggleTables}
        className="flex items-center gap-2"
      >
        <Table className="h-4 w-4" />
        Tables
      </Button>
    </div>
  );
};
