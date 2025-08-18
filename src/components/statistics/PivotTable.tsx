
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.pivot_data?.length) {
    return (
      <Card>
        <CardContent className="p-6">
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
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-lg">
          {getDimensionLabel(data.dimensions.primary)} × {getDimensionLabel(data.dimensions.secondary)} Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="relative">
            <Table className="text-sm border-collapse">
              <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
                <TableRow className="border-b-2 border-primary/20">
                  <TableHead className="sticky left-0 z-30 bg-muted font-bold text-xs p-2 border-r-2 border-primary/20 min-w-[120px]">
                    {getDimensionLabel(data.dimensions.primary)}
                  </TableHead>
                  {uniqueCols.map(col => (
                    <TableHead key={col} className="text-center font-bold text-xs p-2 border-r border-border min-w-[80px] bg-background">
                      {col}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold text-xs p-2 bg-primary text-primary-foreground min-w-[80px]">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueRows.map((row, rowIndex) => (
                  <TableRow key={row} className={`hover:bg-muted/50 ${rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <TableCell className="sticky left-0 z-10 font-bold text-xs p-2 bg-muted border-r-2 border-primary/20 min-w-[120px]">
                      {row}
                    </TableCell>
                    {uniqueCols.map(col => {
                      const value = dataMap.get(`${row}|${col}`) || 0;
                      return (
                        <TableCell key={col} className="text-center p-1 border-r border-border">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs min-w-[24px] ${
                            value > 0 
                              ? 'bg-primary/10 text-primary font-semibold border border-primary/20' 
                              : 'text-muted-foreground'
                          }`}>
                            {value > 0 ? value : '-'}
                          </span>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-bold text-xs p-2 bg-primary/5 border-l-2 border-primary/20">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded font-bold text-xs">
                        {rowTotalsMap.get(row) || 0}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="border-t-2 border-primary/20 bg-primary/5 sticky bottom-0 z-10">
                  <TableCell className="sticky left-0 z-20 font-bold text-xs p-2 bg-primary text-primary-foreground border-r-2 border-primary/20">
                    Total
                  </TableCell>
                  {uniqueCols.map(col => (
                    <TableCell key={col} className="text-center font-bold text-xs p-2 bg-primary/10 border-r border-border">
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded font-bold text-xs">
                        {colTotalsMap.get(col) || 0}
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-xs p-2 bg-primary text-primary-foreground">
                    <span className="font-bold text-sm">
                      {data.grand_total}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
