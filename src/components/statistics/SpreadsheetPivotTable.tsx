
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    <div className="border rounded-md bg-background">
      <Table className="text-xs">
        <TableHeader className="sticky top-0 bg-muted/50">
          <TableRow className="border-b-2">
            <TableHead className="font-semibold bg-muted text-left border-r">
              {getDimensionLabel(data.dimensions.primary)}
            </TableHead>
            {uniqueCols.map(col => (
              <TableHead key={col} className=" text-center font-medium border-r min-w-20 max-w-32">
                <div className="truncate" title={col}>{col}</div>
              </TableHead>
            ))}
            <TableHead className="text-center font-bold bg-accent border-r min-w-16">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uniqueRows.map((row, index) => (
            <TableRow key={row} >
              <TableCell className="font-medium bg-muted/30 border-r sticky left-0 min-w-32 max-w-48">
                <div className="truncate" title={row}>{row}</div>
              </TableCell>
              {uniqueCols.map(col => {
                const value = dataMap.get(`${row}|${col}`) || 0;
                return (
                  <TableCell key={col} className=" text-center border-r">
                    <div className={` rounded text-xs font-mono ${
                      value > 0 
                        ? 'bg-primary/10 text-primary font-semibold' 
                        : 'text-muted-foreground'
                    }`}>
                      {value || '—'}
                    </div>
                  </TableCell>
                );
              })}
              <TableCell className="text-center font-bold bg-accent/50 border-r">
                <div className="font-mono font-semibold">
                  {rowTotalsMap.get(row) || 0}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {/* Totals row */}
          <TableRow className="border-t-2 bg-accent/30 ">
            <TableCell className="font-bold bg-accent border-r sticky left-0">
              Total
            </TableCell>
            {uniqueCols.map(col => (
              <TableCell key={col} className="text-center font-bold bg-accent/50 border-r">
                <div className="font-mono font-semibold">
                  {colTotalsMap.get(col) || 0}
                </div>
              </TableCell>
            ))}
            <TableCell className="text-center font-bold bg-primary text-primary-foreground border-r">
              <div className="font-mono font-bold">
                {data.grand_total}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
