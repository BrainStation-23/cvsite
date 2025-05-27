
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowUpDown } from 'lucide-react';
import { DegreeItem } from '@/utils/degreeCsvUtils';

interface DegreeTableProps {
  degrees: DegreeItem[];
  onDelete: (id: string, name: string) => void;
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const DegreeTable: React.FC<DegreeTableProps> = ({
  degrees,
  onDelete,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />;
  };

  if (degrees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No degrees found. Add some degrees to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort('name')} className="h-auto p-0 font-medium">
              Name
              {getSortIcon('name')}
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort('full_form')} className="h-auto p-0 font-medium">
              Full Form
              {getSortIcon('full_form')}
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort('created_at')} className="h-auto p-0 font-medium">
              Created
              {getSortIcon('created_at')}
            </Button>
          </TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {degrees.map((degree) => (
          <TableRow key={degree.id}>
            <TableCell className="font-medium">{degree.name}</TableCell>
            <TableCell>{degree.full_form || '-'}</TableCell>
            <TableCell>{new Date(degree.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(degree.id, degree.name)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DegreeTable;
