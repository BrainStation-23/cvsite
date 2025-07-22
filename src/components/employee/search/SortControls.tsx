
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EmployeeProfileSortColumn } from '@/hooks/use-employee-profiles-enhanced';

interface SortControlsProps {
  sortBy: EmployeeProfileSortColumn;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: EmployeeProfileSortColumn, order: 'asc' | 'desc') => void;
}

const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  sortOrder,
  onSortChange
}) => {
  const sortOptions: { field: EmployeeProfileSortColumn; label: string }[] = [
    { field: 'first_name', label: 'First Name' },
    { field: 'last_name', label: 'Last Name' },
    { field: 'employee_id', label: 'Employee ID' },
    { field: 'total_experience', label: 'Total Experience' },
    { field: 'company_experience', label: 'Company Experience' },
    { field: 'created_at', label: 'Date Created' },
    { field: 'updated_at', label: 'Last Updated' }
  ];

  const currentSortLabel = sortOptions.find(option => option.field === sortBy)?.label || 'Last Name';

  const handleSortChange = (field: EmployeeProfileSortColumn) => {
    if (field === sortBy) {
      // Toggle order if same field
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new field
      onSortChange(field, 'asc');
    }
  };

  const SortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort: {currentSortLabel}
          <SortIcon className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.field}
            onClick={() => handleSortChange(option.field)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {sortBy === option.field && (
              <SortIcon className="h-3 w-3" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortControls;
