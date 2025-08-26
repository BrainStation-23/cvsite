import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { convertNotFoundEmployeesToCSV, createFileFromCSV, NotFoundEmployee } from '@/utils/odooSyncUtils';

interface UseOdooSyncBulkCreateProps {
  employees: NotFoundEmployee[];
  onBulkUpload: (file: File) => Promise<boolean>;
  onSuccess?: () => void;
}

export function useOdooSyncBulkCreate({ 
  employees, 
  onBulkUpload, 
  onSuccess 
}: UseOdooSyncBulkCreateProps) {
  const { toast } = useToast();
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  const toggleEmployee = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const selectAll = () => {
    setSelectedEmployees(new Set(employees.map(emp => emp.employeeId)));
  };

  const selectNone = () => {
    setSelectedEmployees(new Set());
  };

  const createSelectedUsers = async () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: 'No employees selected',
        description: 'Please select at least one employee to create.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsCreating(true);

      // Filter selected employees
      const selectedEmployeesList = employees.filter(emp => 
        selectedEmployees.has(emp.employeeId)
      );

      // Convert to CSV
      const csvContent = convertNotFoundEmployeesToCSV(selectedEmployeesList);
      
      // Create file object
      const csvFile = createFileFromCSV(
        csvContent, 
        `odoo_sync_users_${new Date().toISOString().split('T')[0]}.csv`
      );

      toast({
        title: 'Creating users...',
        description: `Starting bulk creation of ${selectedEmployees.size} users from Odoo sync data.`
      });

      // Use existing bulk upload functionality
      const success = await onBulkUpload(csvFile);

      if (success) {
        toast({
          title: 'Users created successfully',
          description: `${selectedEmployees.size} users have been created from Odoo sync data.`
        });
        
        // Clear selection
        setSelectedEmployees(new Set());
        
        // Call success callback
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating users from sync data:', error);
      toast({
        title: 'Error creating users',
        description: error.message || 'Failed to create users from sync data.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return {
    selectedEmployees,
    toggleEmployee,
    selectAll,
    selectNone,
    createSelectedUsers,
    isCreating,
    hasSelection: selectedEmployees.size > 0,
    selectedCount: selectedEmployees.size
  };
}
