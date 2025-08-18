
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';

interface PivotTableProps {
  data: PivotStatistics;
  isLoading: boolean;
}

export const PivotTable: React.FC<PivotTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.pivot_data?.length) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-center text-gray-500">No data available for the selected dimensions</div>
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-base">
          {getDimensionLabel(data.dimensions.primary)} × {getDimensionLabel(data.dimensions.secondary)} Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-2">
        <div className="h-full w-full border rounded-md relative">
          <ScrollArea className="h-full w-full">
            <div className="min-w-fit">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs h-7 px-2 sticky left-0 top-0 bg-muted/50 border-r z-20 min-w-[100px]">
                      {getDimensionLabel(data.dimensions.primary)}
                    </TableHead>
                    {uniqueCols.map(col => (
                      <TableHead key={col} className="text-center font-medium text-xs h-7 px-1 min-w-[70px] sticky top-0 bg-muted/50 z-10">
                        <div className="truncate" title={col}>{col}</div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-semibold bg-muted text-xs h-7 px-2 min-w-[70px] sticky top-0 right-0 bg-muted/50 border-l z-20">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueRows.map(row => (
                    <TableRow key={row}>
                      <TableCell className="font-medium text-xs h-6 px-2 bg-muted/30 sticky left-0 border-r z-10 min-w-[100px]">
                        <div className="truncate" title={row}>{row}</div>
                      </TableCell>
                      {uniqueCols.map(col => {
                        const value = dataMap.get(`${row}|${col}`) || 0;
                        return (
                          <TableCell key={col} className="text-center h-6 px-1">
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              value > 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                            }`}>
                              {value}
                            </span>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-medium text-xs h-6 px-2 bg-muted/30 sticky right-0 border-l z-10">
                        {rowTotalsMap.get(row) || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow className="border-t-2 border-primary/20 bg-muted/50">
                    <TableCell className="font-semibold text-xs h-6 px-2 bg-muted/50 sticky left-0 border-r z-20">
                      Total
                    </TableCell>
                    {uniqueCols.map(col => (
                      <TableCell key={col} className="text-center font-medium text-xs h-6 px-2 bg-muted/50">
                        {colTotalsMap.get(col) || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold bg-primary text-primary-foreground text-xs h-6 px-2 sticky right-0 border-l z-20">
                      {data.grand_total}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
