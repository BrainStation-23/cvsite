import React from 'react';
import { useNonBilledPivotTable } from '@/hooks/use-non-billed-analytics';
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table';

interface PivotTableProps {
  startDate?: Date | null;
  endDate?: Date | null;
  benchFilter?: boolean | null;
}

export function PivotTable({ startDate, endDate, benchFilter }: PivotTableProps) {
  interface PivotTableData {
    pivot_data: Array<{
      row_dimension: string;
      col_dimension: string;
      count: number;
      avg_duration?: number;
    }>;
    row_totals?: Array<{ dimension: string; total: number }>;
    col_totals?: Array<{ dimension: string; total: number }>;
    grand_total?: { count: number };
  }

  const { data, isLoading, error } = useNonBilledPivotTable({
    startDate,
    endDate,
    benchFilter,
    primaryDimension: 'sbu',
    secondaryDimension: 'expertise',
    enableGrouping: true,
  }) as { data: PivotTableData | null; isLoading: boolean; error: any };

  if (isLoading) return (
    <div className="flex items-center justify-center h-40">
      <span className="animate-spin mr-2">⏳</span> Loading...
    </div>
  );
  if (error) return <div className="text-destructive">Error loading pivot table data</div>;
  if (!data || !data.pivot_data) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <div>No data available</div>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  const rowDimensions = Array.from(new Set(data.pivot_data.map((d: any) => d.row_dimension)));
  const colDimensions = Array.from(new Set(data.pivot_data.map((d: any) => d.col_dimension)));
  const cellLookup: Record<string, Record<string, any>> = {};
  data.pivot_data.forEach((item: any) => {
    if (!cellLookup[item.row_dimension]) cellLookup[item.row_dimension] = {};
    cellLookup[item.row_dimension][item.col_dimension] = item;
  });
  const rowTotals = data.row_totals || [];
  const colTotals = data.col_totals || [];
  const grandTotal = data.grand_total || null;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 min-h-0">
        <div>
          <div className="rounded-xl border bg-card overflow-x-auto">
            <Table className="text-[14px] min-w-[100%]">
              <TableHeader>
                <TableRow className="border-b bg-muted/40">
                  <TableHead className="sticky left-0 z-20 bg-muted border-r-2 font-semibold min-w-[80px] max-w-[120px] px-1 py-1 text-[13px]">
                    <div className="flex items-center gap-2">
                      SBU / Expertise
                    </div>
                  </TableHead>
                  {colDimensions.map((col) => (
                    <TableHead
                      key={col}
                      className="text-center font-medium border-r min-w-[48px] max-w-[80px] px-1 py-1 text-[13px] bg-primary/5 truncate"
                      title={col}
                    >
                      {col}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold bg-muted border-l-2 min-w-[60px] sticky right-0 z-10 px-1 py-1 text-[13px]">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowDimensions.map((row) => (
                  <TableRow key={row} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="sticky left-0 z-10 bg-card font-semibold px-1 py-1 border-r text-[13px] truncate" style={{ minWidth: 80, maxWidth: 120 }}>
                      {row}
                    </TableCell>
                    {colDimensions.map((col) => {
                      const cell = cellLookup[row]?.[col];
                      return (
                        <TableCell key={col} className="px-1 py-1 text-center border-r min-w-[48px] max-w-[80px] align-middle truncate">
                          <div className="font-semibold text-primary">{cell ? cell.count : '—'}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {cell && cell.avg_duration ? `Avg: ${cell.avg_duration}` : ''}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="px-1 py-1 font-bold text-center border-l sticky right-0 z-10 bg-card min-w-[60px] text-[13px] text-primary truncate">
                      {rowTotals.find((r: any) => r.dimension === row)?.total ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="border-t bg-primary/10 hover:bg-primary/20 transition-colors">
                  <TableCell className="sticky left-0 z-10 bg-muted border-r-2 font-bold px-1 py-1 text-[13px]">
                    Total
                  </TableCell>
                  {colDimensions.map((col) => (
                    <TableCell key={col} className="font-bold px-1 py-1 text-center border-t min-w-[48px] max-w-[80px] text-[13px] text-primary bg-primary/10 truncate">
                      {colTotals.find((c: any) => c.dimension === col)?.total ?? 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold bg-primary text-primary-foreground border-l-2 sticky right-0 z-10 px-1 py-1 min-w-[60px] text-[13px] truncate">
                    <div className="font-mono font-bold">
                      {grandTotal?.count ?? ''}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}