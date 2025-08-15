
import React from 'react';
import { Label } from '@/components/ui/label';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { useEmployeeData } from '@/hooks/use-employee-data';
import { Badge } from '@/components/ui/badge';

interface EmployeeDataSelectorProps {
  selectedEmployeeId: string | null;
  onEmployeeSelect: (employeeId: string | null) => void;
}

export const EmployeeDataSelector: React.FC<EmployeeDataSelectorProps> = ({
  selectedEmployeeId,
  onEmployeeSelect,
}) => {
  const { data: employeeData, isLoading } = useEmployeeData(selectedEmployeeId || '');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Label htmlFor="employee-select" className="text-sm font-medium">
            Select Employee for Preview
          </Label>
          <ProfileCombobox
            value={selectedEmployeeId}
            onValueChange={onEmployeeSelect}
            placeholder="Search employee by name or ID..."
            label="Employee"
          />
        </div>
        
        {selectedEmployeeId && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {isLoading ? 'Loading...' : 'Data loaded'}
            </Badge>
            {employeeData && (
              <span className="text-sm text-muted-foreground">
                {employeeData.general_information?.first_name} {employeeData.general_information?.last_name}
              </span>
            )}
          </div>
        )}
      </div>
      
      {!selectedEmployeeId && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
          💡 Select an employee to preview the CV template with real data
        </div>
      )}
    </div>
  );
};
