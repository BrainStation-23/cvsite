
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
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Employees Not Found in Database ({not_found_employees.length})
              </h4>
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
