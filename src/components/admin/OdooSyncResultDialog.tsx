
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
import { CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import Papa from 'papaparse';

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
}

export const OdooSyncResultDialog: React.FC<OdooSyncResultDialogProps> = ({
  isOpen,
  onOpenChange,
  syncResult
}) => {
  if (!syncResult) return null;

  const { stats, not_found_employees, error_employees } = syncResult;

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
      managerEmail: '',
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
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {syncResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Odoo Employee Sync Results
          </DialogTitle>
          <DialogDescription>
            {syncResult.message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          {/* Not Found Employees */}
          {not_found_employees.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Employees Not Found in Database ({not_found_employees.length})
                </h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadNotFoundEmployeesCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download CSV for Bulk Create
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-md p-3">
                <div className="space-y-2">
                  {not_found_employees.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{employee.employeeId}</div>
                        <div className="text-sm text-gray-600">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.email}</div>
                      </div>
                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                        {employee.sbuName || 'No SBU'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Error Employees */}
          {error_employees.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Employees with Errors ({error_employees.length})
              </h4>
              <ScrollArea className="h-48 border rounded-md p-3">
                <div className="space-y-2">
                  {error_employees.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{employee.employeeId}</div>
                        <div className="text-sm text-red-600">{employee.reason}</div>
                      </div>
                      <Badge variant="destructive">Error</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Success message if no issues */}
          {not_found_employees.length === 0 && error_employees.length === 0 && stats.updated > 0 && (
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
