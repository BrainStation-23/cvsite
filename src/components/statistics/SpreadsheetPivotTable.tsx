
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';

interface SpreadsheetPivotTableProps {
  data: PivotStatistics;
  isLoading: boolean;
}

export const SpreadsheetPivotTable: React.FC<SpreadsheetPivotTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data || !data.pivot_data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available for the selected dimensions
      </div>
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

  return (
    <div className="border rounded-md bg-background overflow-hidden max-w-full">
      <ScrollArea className="w-full max-w-full">
        <div className="min-w-max">
          <Table className="text-xs">
            <TableHeader className="sticky top-0 bg-muted/50 z-20">
              <TableRow className="border-b-2 h-6">
                <TableHead className="h-6 px-2 py-0.5 font-semibold bg-muted text-left border-r sticky left-0 z-30 min-w-32">
                  {getDimensionLabel(data.dimensions.primary)}
                </TableHead>
                {uniqueCols.map(col => (
                  <TableHead key={col} className="h-6 px-2 py-0.5 text-center font-medium border-r min-w-20 max-w-32">
                    <div className="truncate" title={col}>{col}</div>
                  </TableHead>
                ))}
                <TableHead className="h-6 px-2 py-0.5 text-center font-bold bg-accent border-r min-w-16">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueRows.map((row, index) => (
                <TableRow key={row} className="h-5">
                  <TableCell className="h-5 px-2 py-0.5 font-medium bg-muted/30 border-r sticky left-0 z-10 min-w-32 max-w-48">
                    <div className="truncate" title={row}>{row}</div>
                  </TableCell>
                  {uniqueCols.map(col => {
                    const value = dataMap.get(`${row}|${col}`) || 0;
                    return (
                      <TableCell key={col} className="h-5 px-1 py-0.5 text-center border-r">
                        <div className={`text-xs font-mono leading-none ${
                          value > 0 
                            ? 'text-primary font-semibold' 
                            : 'text-muted-foreground'
                        }`}>
                          {value || '—'}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="h-5 px-2 py-0.5 text-center font-bold bg-accent/50 border-r">
                    <div className="font-mono font-semibold leading-none text-xs">
                      {rowTotalsMap.get(row) || 0}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className="border-t-2 bg-accent/30 h-6">
                <TableCell className="h-6 px-2 py-0.5 font-bold bg-accent border-r sticky left-0 z-10">
                  Total
                </TableCell>
                {uniqueCols.map(col => (
                  <TableCell key={col} className="h-6 px-2 py-0.5 text-center font-bold bg-accent/50 border-r">
                    <div className="font-mono font-semibold leading-none text-xs">
                      {colTotalsMap.get(col) || 0}
                    </div>
                  </TableCell>
                ))}
                <TableCell className="h-6 px-2 py-0.5 text-center font-bold bg-primary text-primary-foreground border-r">
                  <div className="font-mono font-bold leading-none text-xs">
                    {data.grand_total}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
