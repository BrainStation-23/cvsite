
import React from 'react';
import { Button } from '@/components/ui/button';
import { PieChart, BarChart3, Table } from 'lucide-react';

export type ChartView = 'pie' | 'bar' | 'table';

interface ChartViewSelectorProps {
  currentView: ChartView;
  onViewChange: (view: ChartView) => void;
}

export const ChartViewSelector: React.FC<ChartViewSelectorProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={currentView === 'pie' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('pie')}
        className="h-8 px-3"
      >
        <PieChart className="h-4 w-4 mr-1" />
        Pie
      </Button>
      <Button
        variant={currentView === 'bar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('bar')}
        className="h-8 px-3"
      >
        <BarChart3 className="h-4 w-4 mr-1" />
        Bar
      </Button>
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-8 px-3"
      >
        <Table className="h-4 w-4 mr-1" />
        Table
      </Button>
    </div>
  );
};
