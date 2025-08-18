
import React, { useRef, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';

interface CustomPivotTableProps {
  data: PivotStatistics;
  isLoading: boolean;
}

interface CellGroup {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  value: string | number;
}

export const CustomPivotTable: React.FC<CustomPivotTableProps> = ({ data, isLoading }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const rowHeaderScrollRef = useRef<HTMLDivElement>(null);
  
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // Handle scroll synchronization
  const handleContentScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollLeft = target.scrollLeft;
    const scrollTop = target.scrollTop;

    // Sync horizontal scroll with header
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollLeft;
    }

    // Sync vertical scroll with row headers
    if (rowHeaderScrollRef.current) {
      rowHeaderScrollRef.current.scrollTop = scrollTop;
    }
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.pivot_data?.length) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">No data available for the selected dimensions</div>
        </CardContent>
      </Card>
    );
  }

  // Transform pivot data into a matrix
  const uniqueRows = [...new Set(data.pivot_data.map(item => item.row_dimension))].sort();
  const uniqueCols = [...new Set(data.pivot_data.map(item => item.col_dimension))].sort();
  
  // Create a lookup map for quick access
  const dataMap = new Map<string, number>();
  data.pivot_data.forEach(item => {
    dataMap.set(`${item.row_dimension}|${item.col_dimension}`, item.count);
  });

  // Create totals maps
  const rowTotalsMap = new Map<string, number>();
  data.row_totals?.forEach(item => {
    rowTotalsMap.set(item.dimension, item.total);
  });

  const colTotalsMap = new Map<string, number>();
  data.col_totals?.forEach(item => {
    colTotalsMap.set(item.dimension, item.total);
  });

  const getDimensionLabel = (dimension: string) => {
    const labels: Record<string, string> = {
      'sbu': 'SBU',
      'resource_type': 'Resource Type',
      'bill_type': 'Bill Type',
      'expertise': 'Expertise Type',
    };
    return labels[dimension] || dimension;
  };

  const cellWidth = 80;
  const cellHeight = 32;
  const frozenWidth = 140;
  const frozenHeight = 32;

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-lg">
          {getDimensionLabel(data.dimensions.primary)} × {getDimensionLabel(data.dimensions.secondary)} Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Top section: Corner cell + Column headers */}
          <div className="flex flex-shrink-0 border-b border-border">
            {/* Corner cell - frozen */}
            <div 
              className="bg-muted border-r border-border flex items-center justify-center font-medium text-xs"
              style={{ width: frozenWidth, height: frozenHeight }}
            >
              {getDimensionLabel(data.dimensions.primary)}
            </div>
            
            {/* Column headers - horizontally scrollable */}
            <div className="flex-1 overflow-hidden">
              <div 
                ref={headerScrollRef}
                className="overflow-x-auto overflow-y-hidden scrollbar-thin"
                style={{ height: frozenHeight }}
              >
                <div className="flex">
                  {uniqueCols.map((col, index) => (
                    <div
                      key={col}
                      className="bg-muted border-r border-border flex items-center justify-center font-medium text-xs px-1 flex-shrink-0"
                      style={{ width: cellWidth, height: frozenHeight }}
                    >
                      <span className="truncate" title={col}>{col}</span>
                    </div>
                  ))}
                  <div
                    className="bg-muted flex items-center justify-center font-bold text-xs flex-shrink-0"
                    style={{ width: cellWidth, height: frozenHeight }}
                  >
                    Total
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section: Row headers + Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Row headers - vertically scrollable */}
            <div className="flex-shrink-0 border-r border-border">
              <div 
                ref={rowHeaderScrollRef}
                className="overflow-y-auto overflow-x-hidden scrollbar-thin h-full"
                style={{ width: frozenWidth }}
              >
                <div>
                  {uniqueRows.map((row, index) => (
                    <div
                      key={row}
                      className="bg-muted border-b border-border flex items-center px-2 font-medium text-xs"
                      style={{ height: cellHeight, minHeight: cellHeight }}
                    >
                      <span className="truncate" title={row}>{row}</span>
                    </div>
                  ))}
                  {/* Total row header */}
                  <div
                    className="bg-muted flex items-center px-2 font-bold text-xs border-t-2 border-primary/20"
                    style={{ height: cellHeight, minHeight: cellHeight }}
                  >
                    Total
                  </div>
                </div>
              </div>
            </div>

            {/* Content area - scrollable in both directions */}
            <div className="flex-1 overflow-hidden">
              <div 
                ref={scrollAreaRef}
                className="overflow-auto scrollbar-thin h-full"
                onScroll={handleContentScroll}
              >
                <div>
                  {/* Data rows */}
                  {uniqueRows.map((row, rowIndex) => (
                    <div key={row} className="flex">
                      {uniqueCols.map((col, colIndex) => {
                        const value = dataMap.get(`${row}|${col}`) || 0;
                        return (
                          <div
                            key={`${row}-${col}`}
                            className="border-r border-b border-border flex items-center justify-center text-xs flex-shrink-0 hover:bg-accent/50 cursor-pointer"
                            style={{ width: cellWidth, height: cellHeight, minHeight: cellHeight }}
                            onClick={() => {
                              const cellKey = `${rowIndex}-${colIndex}`;
                              const newSelected = new Set(selectedCells);
                              if (newSelected.has(cellKey)) {
                                newSelected.delete(cellKey);
                              } else {
                                newSelected.add(cellKey);
                              }
                              setSelectedCells(newSelected);
                            }}
                          >
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              value > 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                            } ${selectedCells.has(`${rowIndex}-${colIndex}`) ? 'ring-2 ring-primary' : ''}`}>
                              {value}
                            </span>
                          </div>
                        );
                      })}
                      {/* Row total */}
                      <div
                        className="bg-muted border-b border-border flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{ width: cellWidth, height: cellHeight, minHeight: cellHeight }}
                      >
                        {rowTotalsMap.get(row) || 0}
                      </div>
                    </div>
                  ))}
                  
                  {/* Totals row */}
                  <div className="flex border-t-2 border-primary/20">
                    {uniqueCols.map(col => (
                      <div
                        key={col}
                        className="bg-muted border-r border-b border-border flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{ width: cellWidth, height: cellHeight, minHeight: cellHeight }}
                      >
                        {colTotalsMap.get(col) || 0}
                      </div>
                    ))}
                    {/* Grand total */}
                    <div
                      className="bg-primary text-primary-foreground border-b border-border flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{ width: cellWidth, height: cellHeight, minHeight: cellHeight }}
                    >
                      {data.grand_total}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
