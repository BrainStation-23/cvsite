
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';

interface SortControlsProps {
  sortBy: EmployeeProfileSortColumn;
  sortOrder: EmployeeProfileSortOrder;
  onSortChange: (column: EmployeeProfileSortColumn, order: EmployeeProfileSortOrder) => void;
}

const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  sortOrder,
  onSortChange
}) => {
  const handleSortChange = (value: string) => {
    const [column, order] = value.split('-') as [EmployeeProfileSortColumn, EmployeeProfileSortOrder];
    onSortChange(column, order);
  };

  // Ensure we have a valid default value
  const currentValue = sortBy && sortOrder ? `${sortBy}-${sortOrder}` : 'last_name-asc';

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sort By
      </label>
      <Select
        value={currentValue}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last_name-asc">Last Name (A-Z)</SelectItem>
          <SelectItem value="last_name-desc">Last Name (Z-A)</SelectItem>
          <SelectItem value="first_name-asc">First Name (A-Z)</SelectItem>
          <SelectItem value="first_name-desc">First Name (Z-A)</SelectItem>
          <SelectItem value="employee_id-asc">Employee ID (A-Z)</SelectItem>
          <SelectItem value="employee_id-desc">Employee ID (Z-A)</SelectItem>
          <SelectItem value="created_at-desc">Recently Added</SelectItem>
          <SelectItem value="created_at-asc">Oldest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortControls;
