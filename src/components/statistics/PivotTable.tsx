
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
      <CardHeader>
        <CardTitle>
          {getDimensionLabel(data.dimensions.primary)} × {getDimensionLabel(data.dimensions.secondary)} Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">
                  {getDimensionLabel(data.dimensions.primary)}
                </TableHead>
                {uniqueCols.map(col => (
                  <TableHead key={col} className="text-center font-medium">
                    {col}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold bg-muted">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueRows.map(row => (
                <TableRow key={row}>
                  <TableCell className="font-medium bg-muted">
                    {row}
                  </TableCell>
                  {uniqueCols.map(col => {
                    const value = dataMap.get(`${row}|${col}`) || 0;
                    return (
                      <TableCell key={col} className="text-center">
                        <span className={`px-2 py-1 rounded text-sm ${
                          value > 0 ? 'bg-primary/10 text-primary font-medium' : 'text-gray-400'
                        }`}>
                          {value}
                        </span>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-bold bg-muted">
                    {rowTotalsMap.get(row) || 0}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className="border-t-2 border-primary/20">
                <TableCell className="font-bold bg-muted">
                  Total
                </TableCell>
                {uniqueCols.map(col => (
                  <TableCell key={col} className="text-center font-bold bg-muted">
                    {colTotalsMap.get(col) || 0}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold bg-primary text-primary-foreground">
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
