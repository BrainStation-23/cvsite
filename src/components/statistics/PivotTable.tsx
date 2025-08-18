
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {getDimensionLabel(data.dimensions.primary)} × {getDimensionLabel(data.dimensions.secondary)} Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="overflow-auto max-h-[600px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs h-8 px-2 sticky left-0 bg-muted/50 border-r">
                  {getDimensionLabel(data.dimensions.primary)}
                </TableHead>
                {uniqueCols.map(col => (
                  <TableHead key={col} className="text-center font-medium text-xs h-8 px-2 min-w-[80px]">
                    {col}
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold bg-muted text-xs h-8 px-2 min-w-[80px] sticky right-0 border-l">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueRows.map(row => (
                <TableRow key={row} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-xs h-7 px-2 bg-muted/30 sticky left-0 border-r max-w-[120px] truncate">
                    {row}
                  </TableCell>
                  {uniqueCols.map(col => {
                    const value = dataMap.get(`${row}|${col}`) || 0;
                    return (
                      <TableCell key={col} className="text-center h-7 px-1">
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          value > 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                        }`}>
                          {value}
                        </span>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-medium text-xs h-7 px-2 bg-muted/30 sticky right-0 border-l">
                    {rowTotalsMap.get(row) || 0}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className="border-t-2 border-primary/20 bg-muted/50">
                <TableCell className="font-semibold text-xs h-7 px-2 bg-muted/50 sticky left-0 border-r">
                  Total
                </TableCell>
                {uniqueCols.map(col => (
                  <TableCell key={col} className="text-center font-medium text-xs h-7 px-2 bg-muted/50">
                    {colTotalsMap.get(col) || 0}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold bg-primary text-primary-foreground text-xs h-7 px-2 sticky right-0 border-l">
                  {data.grand_total}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
