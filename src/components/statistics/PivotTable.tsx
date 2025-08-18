
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
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-lg">
          {getDimensionLabel(data.dimensions.primary)} × {getDimensionLabel(data.dimensions.secondary)} Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full w-full overflow-auto relative">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr>
                {/* Top-left corner cell - sticky to both top and left */}
                <th className="sticky top-0 left-0 z-30 bg-muted font-bold text-xs p-1 border border-border min-w-[100px] max-w-[100px]">
                  {getDimensionLabel(data.dimensions.primary)}
                </th>
                {/* Column headers - sticky to top only */}
                {uniqueCols.map(col => (
                  <th key={col} className="sticky top-0 z-20 text-center font-bold text-xs p-1 border border-border min-w-[70px] max-w-[70px] bg-background truncate" title={col}>
                    {col}
                  </th>
                ))}
                {/* Total column header - sticky to top only */}
                <th className="sticky top-0 z-20 text-center font-bold text-xs p-1 bg-primary text-primary-foreground min-w-[60px] max-w-[60px] border border-border">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {uniqueRows.map((row, rowIndex) => (
                <tr key={row} className={`${rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                  {/* Row header - sticky to left only */}
                  <td className="sticky left-0 z-10 font-bold text-xs p-1 bg-muted border border-border min-w-[100px] max-w-[100px] truncate" title={row}>
                    {row}
                  </td>
                  {/* Data cells - scrollable */}
                  {uniqueCols.map(col => {
                    const value = dataMap.get(`${row}|${col}`) || 0;
                    return (
                      <td key={col} className="text-center p-0.5 border border-border min-w-[70px] max-w-[70px]">
                        <span className={`inline-block px-1 py-0.5 rounded text-xs w-full ${
                          value > 0 
                            ? 'bg-primary/10 text-primary font-semibold' 
                            : 'text-muted-foreground'
                        }`}>
                          {value > 0 ? value : '-'}
                        </span>
                      </td>
                    );
                  })}
                  {/* Row total - scrollable */}
                  <td className="text-center font-bold text-xs p-1 bg-primary/5 border border-border min-w-[60px] max-w-[60px]">
                    <span className="bg-primary/10 text-primary px-1 py-0.5 rounded font-bold text-xs">
                      {rowTotalsMap.get(row) || 0}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-primary/5">
                {/* Total row header - sticky to left */}
                <td className="sticky left-0 z-10 font-bold text-xs p-1 bg-primary text-primary-foreground border border-border min-w-[100px] max-w-[100px]">
                  Total
                </td>
                {/* Column totals - scrollable */}
                {uniqueCols.map(col => (
                  <td key={col} className="text-center font-bold text-xs p-1 bg-primary/10 border border-border min-w-[70px] max-w-[70px]">
                    <span className="bg-primary/20 text-primary px-1 py-0.5 rounded font-bold text-xs">
                      {colTotalsMap.get(col) || 0}
                    </span>
                  </td>
                ))}
                {/* Grand total - scrollable */}
                <td className="text-center font-bold text-xs p-1 bg-primary text-primary-foreground border border-border min-w-[60px] max-w-[60px]">
                  <span className="font-bold text-xs">
                    {data.grand_total}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
