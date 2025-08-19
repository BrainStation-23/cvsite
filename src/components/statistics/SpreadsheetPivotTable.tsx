
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PivotStatistics } from '@/hooks/use-resource-pivot-statistics';
import { Loader2, TrendingUp } from 'lucide-react';

interface SpreadsheetPivotTableProps {
  data: PivotStatistics;
  isLoading: boolean;
}

export const SpreadsheetPivotTable: React.FC<SpreadsheetPivotTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading pivot data...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.pivot_data?.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center space-y-3">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium">No data available</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting the dimension filters or check your data source
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Transform pivot data into a matrix
  const uniqueRows = [...new Set(data.pivot_data.map(item => item.row_dimension))].sort();
  const uniqueCols = [...new Set(data.pivot_data.map(item => item.col_dimension))].sort();
  
  // Create lookup maps
  const dataMap = new Map<string, number>();
  data.pivot_data.forEach(item => {
    dataMap.set(`${item.row_dimension}|${item.col_dimension}`, item.count);
  });

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
    return labels[dimension] || dimension.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getIntensityClass = (value: number, maxValue: number) => {
    if (value === 0) return 'bg-background';
    const intensity = value / maxValue;
    if (intensity > 0.7) return 'bg-primary/20 text-primary';
    if (intensity > 0.4) return 'bg-primary/10 text-primary';
    if (intensity > 0.2) return 'bg-primary/5';
    return 'bg-background';
  };

  // Calculate max value for intensity coloring
  const maxValue = Math.max(...data.pivot_data.map(item => item.count));

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Summary Bar */}
      <div className="flex-shrink-0 px-6 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground">
              Showing <span className="font-medium">{uniqueRows.length}</span> rows × <span className="font-medium">{uniqueCols.length}</span> columns
            </span>
            <span className="text-muted-foreground">
              Total: <span className="font-bold text-foreground">{data.grand_total}</span> resources
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Rows: {getDimensionLabel(data.dimensions.primary)} | Columns: {getDimensionLabel(data.dimensions.secondary)}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="min-w-max p-6">
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="border-b-2 bg-muted/50">
                    <TableHead className="sticky left-0 z-20 bg-muted border-r-2 font-semibold min-w-40 max-w-48">
                      <div className="flex items-center gap-2">
                        <span>{getDimensionLabel(data.dimensions.primary)}</span>
                      </div>
                    </TableHead>
                    {uniqueCols.map(col => (
                      <TableHead key={col} className="text-center font-medium border-r min-w-24 max-w-32 px-2">
                        <div className="truncate font-semibold" title={col}>
                          {col}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold bg-primary/10 border-l-2 min-w-20 sticky right-0 z-10">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueRows.map((row, index) => (
                    <TableRow key={row} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="sticky left-0 z-10 bg-card border-r-2 font-medium min-w-40 max-w-48">
                        <div className="truncate font-medium" title={row}>
                          {row}
                        </div>
                      </TableCell>
                      {uniqueCols.map(col => {
                        const value = dataMap.get(`${row}|${col}`) || 0;
                        return (
                          <TableCell key={col} className={`text-center border-r px-2 ${getIntensityClass(value, maxValue)}`}>
                            <div className="font-mono text-sm font-medium py-1">
                              {value || '—'}
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold bg-primary/5 border-l-2 sticky right-0 z-10 bg-card">
                        <div className="font-mono font-bold text-primary">
                          {rowTotalsMap.get(row) || 0}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow className="border-t-2 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <TableCell className="sticky left-0 z-10 bg-primary/10 border-r-2 font-bold">
                      Total
                    </TableCell>
                    {uniqueCols.map(col => (
                      <TableCell key={col} className="text-center font-bold bg-primary/10 border-r px-2">
                        <div className="font-mono font-bold text-primary">
                          {colTotalsMap.get(col) || 0}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold bg-primary text-primary-foreground border-l-2 sticky right-0 z-10">
                      <div className="font-mono font-bold">
                        {data.grand_total}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
};
