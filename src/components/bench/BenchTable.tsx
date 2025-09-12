import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { BenchTableRow } from './BenchTableRow';
import { BenchTableMobile } from './BenchTableMobile';
import { BenchRecord } from './types/benchRecord';

interface BenchTableProps {
  benchRecords: BenchRecord[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const BenchTable: React.FC<BenchTableProps> = ({
  benchRecords,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const sortableColumns = [
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'employee_name', label: 'Employee' },
    { key: 'expertise', label: 'Expertise' },
    { key: 'bill_type', label: 'Bill Type' },
    { key: 'bench_date', label: 'Bench Date' },
    { key: 'sbu_name', label: 'SBU' },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bench Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (benchRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bench Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No resources found on bench.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Bench Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {sortableColumns.map((column) => (
                    <TableHead key={column.key}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium"
                        onClick={() => onSort(column.key)}
                      >
                        {column.label}
                        {getSortIcon(column.key)}
                      </Button>
                    </TableHead>
                  ))}
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benchRecords.map((record, index) => (
                  <BenchTableRow key={`${record.employee_id}-${index}`} record={record} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bench Resources ({benchRecords.length})</h3>
        </div>
        {benchRecords.map((record, index) => (
          <BenchTableMobile key={`${record.employee_id}-${index}`} record={record} />
        ))}
      </div>
    </div>
  );
};