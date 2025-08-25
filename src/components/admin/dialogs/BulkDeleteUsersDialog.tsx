
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, X, Download, AlertTriangle, Users, Trash2, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface BulkDeleteUsersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

interface ParsedCSVData {
  employeeIds: string[];
  errors: string[];
}

interface PreviewData {
  usersToDelete: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  }>;
  usersNotFound: string[];
}

export const BulkDeleteUsersDialog: React.FC<BulkDeleteUsersDialogProps> = ({
  isOpen,
  onOpenChange,
  onComplete
}) => {
  const { toast } = useToast();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [deleteMode, setDeleteMode] = useState<'keep_listed' | 'delete_listed'>('delete_listed');
  const [csvData, setCsvData] = useState<ParsedCSVData | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setUploadFile(null);
    setCsvData(null);
    setPreviewData(null);
    setStep('upload');
    setIsProcessing(false);
    setIsGeneratingPreview(false);
  };

  const parseCSV = (file: File): Promise<ParsedCSVData> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const employeeIds: string[] = [];
          const errors: string[] = [];

          results.data.forEach((row: any, index: number) => {
            if (Array.isArray(row) && row.length > 0) {
              const employeeId = String(row[0]).trim();
              if (employeeId) {
                employeeIds.push(employeeId);
              } else {
                errors.push(`Row ${index + 1}: Empty employee ID`);
              }
            }
          });

          resolve({ employeeIds, errors });
        },
        error: () => {
          resolve({ employeeIds: [], errors: ['Failed to parse CSV file'] });
        }
      });
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadFile(file);
      
      const parsed = await parseCSV(file);
      setCsvData(parsed);
      
      if (parsed.employeeIds.length > 0) {
        setStep('preview');
      }
    }
  };

  const generatePreview = async () => {
    if (!csvData) return;

    setIsGeneratingPreview(true);
    try {
      // Get all users from database
      const { data: allUsers, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, employee_id')
        .not('employee_id', 'is', null);

      if (error) throw error;

      const allUsersList = allUsers || [];
      const csvEmployeeIds = new Set(csvData.employeeIds);
      
      let usersToDelete: PreviewData['usersToDelete'] = [];
      let usersNotFound: string[] = [];

      if (deleteMode === 'delete_listed') {
        // Delete only the users in the CSV
        csvData.employeeIds.forEach(empId => {
          const user = allUsersList.find(u => u.employee_id === empId);
          if (user) {
            usersToDelete.push({
              id: user.id,
              email: user.email || '',
              firstName: user.first_name || '',
              lastName: user.last_name || '',
              employeeId: user.employee_id || ''
            });
          } else {
            usersNotFound.push(empId);
          }
        });
      } else {
        // Delete all users NOT in the CSV (keep only listed ones)
        usersToDelete = allUsersList
          .filter(user => user.employee_id && !csvEmployeeIds.has(user.employee_id))
          .map(user => ({
            id: user.id,
            email: user.email || '',
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            employeeId: user.employee_id || ''
          }));

        // Find CSV employee IDs that don't exist in database
        usersNotFound = csvData.employeeIds.filter(empId => 
          !allUsersList.some(user => user.employee_id === empId)
        );
      }

      setPreviewData({ usersToDelete, usersNotFound });
      setStep('confirm');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate preview. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const downloadExcelReport = () => {
    if (!previewData) return;

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Users to be deleted
      const usersToDeleteData = previewData.usersToDelete.map(user => ({
        'Employee ID': user.employeeId,
        'First Name': user.firstName,
        'Last Name': user.lastName,
        'Email': user.email,
        'Database ID': user.id
      }));

      const usersSheet = XLSX.utils.json_to_sheet(usersToDeleteData);
      XLSX.utils.book_append_sheet(wb, usersSheet, 'Users to Delete');

      // Sheet 2: Employee IDs not found
      const notFoundData = previewData.usersNotFound.map(empId => ({
        'Employee ID': empId,
        'Status': 'Not found in database'
      }));

      const notFoundSheet = XLSX.utils.json_to_sheet(notFoundData);
      XLSX.utils.book_append_sheet(wb, notFoundSheet, 'Not Found');

      // Sheet 3: Summary
      const summaryData = [
        { 'Metric': 'Delete Mode', 'Value': deleteMode === 'delete_listed' ? 'Delete Listed Users' : 'Keep Listed Users (Delete Others)' },
        { 'Metric': 'Total Employee IDs in CSV', 'Value': csvData?.employeeIds.length || 0 },
        { 'Metric': 'Users to be Deleted', 'Value': previewData.usersToDelete.length },
        { 'Metric': 'Employee IDs Not Found', 'Value': previewData.usersNotFound.length },
        { 'Metric': 'Report Generated', 'Value': new Date().toLocaleString() }
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `bulk_delete_preview_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast({
        title: 'Success',
        description: 'Excel report downloaded successfully.'
      });
    } catch (error) {
      console.error('Error generating Excel report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate Excel report.',
        variant: 'destructive'
      });
    }
  };

  const executeBulkDelete = async () => {
    if (!previewData || previewData.usersToDelete.length === 0) return;

    setIsProcessing(true);
    try {
      const userIds = previewData.usersToDelete.map(user => user.id);
      
      const { error } = await supabase.functions.invoke('bulk-delete-users', {
        body: { userIds }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Successfully deleted ${previewData.usersToDelete.length} users.`
      });

      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete users. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = ['EMP001', 'EMP002', 'EMP003'];
    const csv = templateData.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'employee_ids_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Bulk Delete Users
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {step === 'upload' && (
            <>
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Select Delete Mode:</Label>
                  <RadioGroup value={deleteMode} onValueChange={(value: any) => setDeleteMode(value)} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delete_listed" id="delete_listed" />
                      <Label htmlFor="delete_listed" className="cursor-pointer">
                        Delete listed employee IDs (Delete only the users in the CSV)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="keep_listed" id="keep_listed" />
                      <Label htmlFor="keep_listed" className="cursor-pointer">
                        Keep listed employee IDs (Delete all other users NOT in the CSV)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> This action cannot be undone. 
                    {deleteMode === 'keep_listed' 
                      ? ' All users NOT in your CSV will be permanently deleted.'
                      : ' All users in your CSV will be permanently deleted.'
                    }
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Upload CSV File</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      CSV should contain one employee ID per row
                    </p>
                  </div>
                  <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
                    <Download size={16} />
                    Download Template
                  </Button>
                </div>

                <Input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />

                {uploadFile && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {uploadFile.name}
                      <button 
                        onClick={() => {
                          setUploadFile(null);
                          setCsvData(null);
                        }}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  </div>
                )}

                {csvData && csvData.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div>Found {csvData.errors.length} errors in CSV:</div>
                        {csvData.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="text-sm">• {error}</div>
                        ))}
                        {csvData.errors.length > 5 && (
                          <div className="text-sm">... and {csvData.errors.length - 5} more</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {csvData && csvData.employeeIds.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">CSV Summary</span>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Found {csvData.employeeIds.length} employee IDs in CSV
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 'preview' && csvData && (
            <div className="space-y-4">
              <div className="text-center">
                <Button 
                  onClick={generatePreview} 
                  disabled={isGeneratingPreview}
                  className="flex items-center gap-2"
                >
                  {isGeneratingPreview ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Preview...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      Generate Preview ({csvData.employeeIds.length} Employee IDs)
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Click above to see which users will be affected before proceeding
              </div>
            </div>
          )}

          {step === 'confirm' && previewData && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Final Confirmation Required</strong><br />
                  {previewData.usersToDelete.length} users will be permanently deleted.
                </AlertDescription>
              </Alert>

              {previewData.usersToDelete.length > 0 && (
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-3">
                    Users to be deleted ({previewData.usersToDelete.length}):
                  </h4>
                  <div className="space-y-2">
                    {previewData.usersToDelete.map((user) => (
                      <div key={user.id} className="flex items-center justify-between text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-gray-600">{user.email}</div>
                        </div>
                        <Badge variant="outline">{user.employeeId}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewData.usersNotFound.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-3">
                    Employee IDs not found in database ({previewData.usersNotFound.length}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {previewData.usersNotFound.map((empId) => (
                      <Badge key={empId} variant="secondary">{empId}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={downloadExcelReport}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download Excel Report
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          
          {step === 'upload' && csvData && csvData.employeeIds.length > 0 && (
            <Button onClick={() => setStep('preview')}>
              Next
            </Button>
          )}
          
          {step === 'preview' && (
            <Button variant="outline" onClick={() => setStep('upload')}>
              Back
            </Button>
          )}
          
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('preview')}>
                Back
              </Button>
              <Button 
                variant="destructive"
                onClick={executeBulkDelete} 
                disabled={isProcessing || previewData.usersToDelete.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  `Delete ${previewData.usersToDelete.length} Users`
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
