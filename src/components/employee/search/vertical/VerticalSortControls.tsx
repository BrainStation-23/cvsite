
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';

interface VerticalSortControlsProps {
  sortBy: EmployeeProfileSortColumn;
  sortOrder: EmployeeProfileSortOrder;
  onSortChange: (column: EmployeeProfileSortColumn, order: EmployeeProfileSortOrder) => void;
}

const VerticalSortControls: React.FC<VerticalSortControlsProps> = ({
  sortBy,
  sortOrder,
  onSortChange
}) => {
  const handleSortChange = (value: string) => {
    const [column, order] = value.split('-') as [EmployeeProfileSortColumn, EmployeeProfileSortOrder];
    onSortChange(column, order);
  };

  return (
    <Card className="border-gray-200 bg-gray-50/30 dark:bg-gray-900/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full text-sm">
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
      </CardContent>
    </Card>
  );
};

export default VerticalSortControls;
