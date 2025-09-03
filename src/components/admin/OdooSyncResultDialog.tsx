
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, AlertTriangle, Download, UserPlus, Users } from 'lucide-react';
import Papa from 'papaparse';
import { useOdooSyncBulkCreate } from '@/hooks/use-odoo-sync-bulk-create';

interface SyncStats {
  total_processed: number;
  updated: number;
  not_found: number;
  errors: number;
  total_fetched?: number;
  valid_employees?: number;
}

interface NotFoundEmployee {
  employeeId: string;
  name: string;
  email: string;
  sbuName: string;
  managerEmail?: string;
}

interface ErrorEmployee {
  employeeId: string;
  reason: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  stats: SyncStats;
  not_found_employees: NotFoundEmployee[];
  error_employees: ErrorEmployee[];
}

interface OdooSyncResultDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  syncResult: SyncResult | null;
  onBulkUpload?: (file: File) => Promise<boolean>;
  onRefreshUsers?: () => void;
}

export const OdooSyncResultDialog: React.FC<OdooSyncResultDialogProps> = ({
  isOpen,
  onOpenChange,
  syncResult,
  onBulkUpload,
  onRefreshUsers
}) => {
  if (!syncResult) return null;

  const { stats, not_found_employees, error_employees } = syncResult;

  const bulkCreateHook = useOdooSyncBulkCreate({
    employees: not_found_employees,
    onBulkUpload: onBulkUpload || (async () => false),
    onSuccess: onRefreshUsers
  });

  const {
    selectedEmployees,
    toggleEmployee,
    selectAll,
    selectNone,
    createSelectedUsers,
    isCreating,
    hasSelection,
    selectedCount
  } = bulkCreateHook;

  const downloadNotFoundEmployeesCSV = () => {
    if (!not_found_employees || not_found_employees.length === 0) return;

    // Transform not found employees to bulk create format
    const csvData = not_found_employees.map(employee => ({
      email: employee.email || '',
      firstName: employee.name ? employee.name.split(' ')[0] : '',
      lastName: employee.name ? employee.name.split(' ').slice(1).join(' ') : '',
      role: 'employee',
      password: '', // Will be auto-generated
      employeeId: employee.employeeId || '',
      managerEmail: employee.managerEmail || '',
      sbuName: employee.sbuName || '',
      expertiseName: '',
      resourceTypeName: '',
      dateOfJoining: '',
      careerStartDate: ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `not_found_employees_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
<Dialog open={isOpen} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
    {/* Fixed Header */}
    <DialogHeader className="flex-shrink-0 pb-4">
      <DialogTitle className="flex items-center gap-2">
        {syncResult.success ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        Odoo Employee Sync Results
      </DialogTitle>
      <DialogDescription>{syncResult.message}</DialogDescription>
    </DialogHeader>

    {/* Statistics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0 pb-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.total_processed}</div>
        <div className="text-sm text-gray-600">Processed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.updated}</div>
        <div className="text-sm text-gray-600">Updated</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{stats.not_found}</div>
        <div className="text-sm text-gray-600">Not Found</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
        <div className="text-sm text-gray-600">Errors</div>
      </div>
    </div>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-y-auto">
      {/* Not Found Employees */}
      {not_found_employees.length > 0 && (
        <div className="mb-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-white z-10 py-2">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Employees Not Found in Database ({not_found_employees.length})
            </h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadNotFoundEmployeesCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              {onBulkUpload && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={createSelectedUsers}
                  disabled={!hasSelection || isCreating}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  {isCreating ? 'Creating...' : `Create Selected (${selectedCount})`}
                </Button>
              )}
            </div>
          </div>

          {/* Employee List Container */}
          <div className="border rounded-md">
            {/* Selection Controls */}
            {onBulkUpload && (
              <div className="flex flex-col gap-3 p-3 border-b bg-gray-50 rounded-t-md">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedEmployees.size === not_found_employees.length &&
                      not_found_employees.length > 0
                    }
                    onCheckedChange={(checked) =>
                      checked ? selectAll() : selectNone()
                    }
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select All ({not_found_employees.length})
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectNone}
                    disabled={selectedEmployees.size === 0}
                  >
                    Clear Selection
                  </Button>
                  {hasSelection && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Users className="h-4 w-4" />
                      {selectedCount} selected
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Employee Rows */}
            <div className="space-y-2 p-3">
              {not_found_employees.map((employee, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-orange-50 rounded"
                >
                  {onBulkUpload && (
                    <Checkbox
                      id={`employee-${employee.employeeId}`}
                      checked={selectedEmployees.has(employee.employeeId)}
                      onCheckedChange={() => toggleEmployee(employee.employeeId)}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{employee.employeeId}</div>
                    <div className="text-sm text-gray-600">{employee.name}</div>
                    <div className="text-xs text-gray-500">{employee.email}</div>
                    {employee.managerEmail && (
                      <div className="text-xs text-gray-500">
                        Manager: {employee.managerEmail}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-orange-700 border-orange-300"
                  >
                    {employee.sbuName || 'No SBU'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Employees */}
      {error_employees.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2 sticky top-0 bg-white z-10 py-2">
            <XCircle className="h-4 w-4 text-red-500" />
            Employees with Errors ({error_employees.length})
          </h4>
          <div className="space-y-2 border rounded-md p-3">
            {error_employees.map((employee, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-red-50 rounded"
              >
                <div className="flex-1">
                  <div className="font-medium">{employee.employeeId}</div>
                  <div className="text-sm text-red-600">{employee.reason}</div>
                </div>
                <Badge variant="destructive">Error</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success State */}
      {not_found_employees.length === 0 &&
        error_employees.length === 0 &&
        stats.updated > 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-green-700">
              All employees synchronized successfully!
            </p>
          </div>
        )}
    </div>
  </DialogContent>
</Dialog>

  );
};
