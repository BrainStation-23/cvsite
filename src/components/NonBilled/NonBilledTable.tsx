import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { NonBilledTableRow } from './NonBilledTableRow';
import { NonBilledTableMobile } from './NonBilledTableMobile';
import { NonBilledRecord } from './types/NonBilledRecord';
import PDFExportModal from '../employee/PDFExportModal';

interface NonBilledTableProps {
  nonBilledRecords: NonBilledRecord[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const NonBilledTable: React.FC<NonBilledTableProps> = ({
  nonBilledRecords,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const [pdfExportModalOpen, setPdfExportModalOpen] = useState(false);
  const [selectedEmployeeForPDF, setSelectedEmployeeForPDF] = useState<{ id: string; name: string } | null>(null);

  const handlePDFExport = (profileId: string, employeeName: string) => {
    setSelectedEmployeeForPDF({ id: profileId, name: employeeName });
    setPdfExportModalOpen(true);
  };

  const handleClosePDFExportModal = () => {
    setPdfExportModalOpen(false);
    setSelectedEmployeeForPDF(null);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const sortableColumns = [
    { 
      key: 'employee', 
      label: 'Employee',
      subKeys: ['employee_id', 'employee_name', 'expertise'] // For sorting
    },
    { key: 'bill_type', label: 'Bill Type' },
    { key: 'bench_date', label: 'Bench Date' },
    { key: 'sbu_name', label: 'SBU' },
  ] as const;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Non-Billed Resources</CardTitle>
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

  if (nonBilledRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Non-Billed Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No non-billed resources found.</p>
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
            <CardTitle>Non-Billed Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium justify-start"
                        onClick={() => onSort('employee_name')}
                      >
                        Employee {getSortIcon('employee_name')}
                      </Button>
                      <div className="flex gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-muted-foreground justify-start"
                          onClick={() => onSort('employee_id')}
                        >
                          ID {getSortIcon('employee_id')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-muted-foreground justify-start"
                          onClick={() => onSort('expertise')}
                        >
                          Expertise {getSortIcon('expertise')}
                        </Button>
                      </div>
                    </div>
                  </TableHead>
                  {sortableColumns.filter(col => col.key !== 'employee').map((column) => (
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
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nonBilledRecords.map((record, index) => (
                  <NonBilledTableRow key={`${record.employee_id}-${index}`} record={record} onPDFExport={handlePDFExport}/>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bench Resources ({nonBilledRecords.length})</h3>
        </div>
        {nonBilledRecords.map((record, index) => (
          <NonBilledTableMobile key={`${record.employee_id}-${index}`} record={record} />
        ))}
      </div>

      {selectedEmployeeForPDF && (
        <PDFExportModal
          isOpen={pdfExportModalOpen}
          onClose={handleClosePDFExportModal}
          employeeId={selectedEmployeeForPDF.id}
          employeeName={selectedEmployeeForPDF.name}
        />
      )}
    </div>
  );
};