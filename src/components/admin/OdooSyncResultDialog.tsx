
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, AlertTriangle, Download, UserPlus, Users, Copy, FileDown, Ban } from 'lucide-react';
import Papa from 'papaparse';
import { useOdooSyncBulkCreate } from '@/hooks/use-odoo-sync-bulk-create';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList } from '@radix-ui/react-tabs';
import { TabTriggerWithIcon } from '../profile/tabs/TabTriggerWithIcon';

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
  // Always call hooks at the top level
  // Provide default values if syncResult is null to avoid conditional hook calls
  const stats = syncResult?.stats ?? { total_processed: 0, updated: 0, not_found: 0, errors: 0 };
  const not_found_employees = syncResult?.not_found_employees ?? [];
  const error_employees = syncResult?.error_employees ?? [];

  // Normalize and validate the data arrays
  const normalizedNotFoundEmployees = Array.isArray(not_found_employees) ? not_found_employees : [];
  const normalizedErrorEmployees = Array.isArray(error_employees) ? error_employees : [];

  const bulkCreateHook = useOdooSyncBulkCreate({
    employees: normalizedNotFoundEmployees,
    onBulkUpload: onBulkUpload || (async () => false),
    onSuccess: onRefreshUsers
  });

  if (!syncResult) return null;

  // Check if the conditional rendering should trigger
  const shouldShowNotFound = normalizedNotFoundEmployees.length > 0;
  const shouldShowErrors = normalizedErrorEmployees.length > 0;

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
    if (!normalizedNotFoundEmployees || normalizedNotFoundEmployees.length === 0) return;

    // Transform not found employees to bulk create format
    const csvData = normalizedNotFoundEmployees.map(employee => ({
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

  const downloadErrorsCSV = () => {
    if (!normalizedErrorEmployees || normalizedErrorEmployees.length === 0) return;

    const csvData = normalizedErrorEmployees.map(employee => ({
      employeeId: employee.employeeId,
      errorMessage: employee.reason,
      timestamp: new Date().toISOString()
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sync_errors_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyErrorsToClipboard = () => {
    if (!normalizedErrorEmployees || normalizedErrorEmployees.length === 0) return;

    const errorText = normalizedErrorEmployees
      .map(employee => `${employee.employeeId}: ${employee.reason}`)
      .join('\n');

    navigator.clipboard.writeText(errorText).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Error details have been copied to your clipboard",
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Could not copy error details to clipboard",
        variant: "destructive"
      });
    });
  };

  const getErrorCategory = (reason: string) => {
    if (reason.includes('foreign key constraint')) return 'Missing Reference';
    if (reason.includes('not-null constraint')) return 'Missing Data';
    if (reason.includes('duplicate key')) return 'Duplicate Entry';
    if (reason.includes('invalid input')) return 'Invalid Data';
    return 'Database Error';
  };

  const getErrorSeverity = (reason: string) => {
    if (reason.includes('not-null constraint')) return 'Critical';
    if (reason.includes('foreign key constraint')) return 'High';
    return 'Medium';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
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

        {/* Stats */}
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

        {/* Main content area: prevent parent scrolling; children decide their own scroll */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="not-found" className="w-full h-full flex flex-col mt-3">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 dark:bg-gray-800 rounded-md p-2 mt-6">
              <TabTriggerWithIcon
              value="not-found"
                icon={Users}
                label="Not Found"
                isEmpty={false}
                dataTour="not-found"
              />
              <TabTriggerWithIcon
                value="errors"
                icon={Ban}
                label="Error Report"
                isEmpty={false}
                dataTour="errors"
              />
            </TabsList>
            <TabsContent value="not-found" className="mt-6">
              {shouldShowNotFound && (
                <section className="mb-6">
                  {/* Section header + actions (never scrolls) */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Employees Not Found in Database ({normalizedNotFoundEmployees.length})
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

                  {/* Bordered container; header (select all) fixed; only rows scroll */}
                  <div className="border rounded-md overflow-hidden">
                    {/* Select All block (non-scrolling, vertical layout) */}
                    {onBulkUpload && (
                      <div className="p-3 bg-gray-50 border-b">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="select-all"
                              checked={
                                normalizedNotFoundEmployees.length > 0 &&
                                selectedEmployees.size === normalizedNotFoundEmployees.length
                              }
                              onCheckedChange={(checked) => (checked ? selectAll() : selectNone())}
                            />
                            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                              Select All ({normalizedNotFoundEmployees.length})
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
                      </div>
                    )}

                    {/* Scrollable rows only */}
                    <div className="max-h-[35vh] overflow-y-auto p-3 space-y-2">
                      {normalizedNotFoundEmployees.map((employee, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded">
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
                              <div className="text-xs text-gray-500">Manager: {employee.managerEmail}</div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            {employee.sbuName || 'No SBU'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="errors" className="mt-6">
              {shouldShowErrors && (
                <section className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Employees with Errors ({normalizedErrorEmployees.length})
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyErrorsToClipboard}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Errors
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadErrorsCSV}
                        className="flex items-center gap-2"
                      >
                        <FileDown className="h-4 w-4" />
                        Download CSV
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-[35vh] overflow-y-auto p-3 space-y-3">
                      {normalizedErrorEmployees.map((employee, index) => {
                        const category = getErrorCategory(employee.reason);
                        const severity = getErrorSeverity(employee.reason);

                        return (
                          <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-red-900">{employee.employeeId}</div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${severity === 'Critical' ? 'border-red-500 text-red-700' :
                                      severity === 'High' ? 'border-orange-500 text-orange-700' :
                                        'border-yellow-500 text-yellow-700'
                                    }`}
                                >
                                  {severity}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm text-red-700 leading-relaxed">
                              <strong>Error:</strong> {employee.reason}
                            </div>
                            {category === 'Missing Reference' && (
                              <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                                <strong>Suggestion:</strong> Check if the referenced designation exists in the system or update the employee's job position in Odoo.
                              </div>
                            )}
                            {category === 'Missing Data' && (
                              <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                                <strong>Suggestion:</strong> Complete the missing information in Odoo before syncing.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}
            </TabsContent>
          </Tabs>
          {/* Success State */}
          {normalizedNotFoundEmployees.length === 0 && normalizedErrorEmployees.length === 0 && stats.updated > 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-700">All employees synchronized successfully!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

  );
};
