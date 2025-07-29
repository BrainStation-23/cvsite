
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  parseBulkResourcePlanningCSV, 
  validateBulkResourcePlanningCSVData, 
  downloadBulkResourcePlanningTemplate,
  BulkResourcePlanningValidationResult 
} from '@/utils/bulkResourcePlanningCsvUtils';
import { BulkResourcePlanningCSVValidation } from './BulkResourcePlanningCSVValidation';

interface BulkResourcePlanningImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkResourcePlanningImport: React.FC<BulkResourcePlanningImportProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<BulkResourcePlanningValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a CSV file.',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);

    try {
      const data = await parseBulkResourcePlanningCSV(selectedFile);
      const validation = validateBulkResourcePlanningCSVData(data);
      setValidationResult(validation);
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description: 'Failed to parse the CSV file. Please check the format.',
        variant: 'destructive'
      });
    }
  };

  const handleBulkImport = async () => {
    if (!validationResult?.valid.length) return;

    setIsProcessing(true);
    try {
      const importData = [];
      
      // Process each valid row
      for (const row of validationResult.valid) {
        // Find profile by employee_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('employee_id', row.employee_id)
          .single();

        if (profileError || !profile) {
          toast({
            title: 'Employee not found',
            description: `Employee with ID ${row.employee_id} not found in the system.`,
            variant: 'destructive'
          });
          continue;
        }

        // Find bill type by name
        const { data: billType, error: billTypeError } = await supabase
          .from('bill_types')
          .select('id')
          .ilike('name', row.bill_type)
          .single();

        if (billTypeError || !billType) {
          toast({
            title: 'Bill type not found',
            description: `Bill type "${row.bill_type}" not found in the system.`,
            variant: 'destructive'
          });
          continue;
        }

        // Find project by name
        const { data: project, error: projectError } = await supabase
          .from('projects_management')
          .select('id')
          .ilike('project_name', row.project_name)
          .single();

        if (projectError || !project) {
          toast({
            title: 'Project not found',
            description: `Project "${row.project_name}" not found in the system.`,
            variant: 'destructive'
          });
          continue;
        }

        importData.push({
          profile_id: profile.id,
          bill_type_id: billType.id,
          project_id: project.id,
          engagement_percentage: row.engagement_percentage,
          billing_percentage: row.billing_percentage,
          engagement_start_date: row.start_date,
          release_date: row.release_date,
          engagement_complete: false,
          weekly_validation: false
        });
      }

      if (importData.length === 0) {
        toast({
          title: 'No valid data to import',
          description: 'All records failed validation or reference checking.',
          variant: 'destructive'
        });
        return;
      }

      // Insert all valid records
      const { error: insertError } = await supabase
        .from('resource_planning')
        .insert(importData);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Import successful',
        description: `${importData.length} resource planning records imported successfully.`
      });

      onSuccess();
      handleClose();
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to import resource planning data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadBulkResourcePlanningTemplate();
    toast({
      title: 'Template downloaded',
      description: 'CSV template for bulk resource planning has been downloaded.'
    });
  };

  const handleClose = () => {
    setFile(null);
    setValidationResult(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Resource Planning Import</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Download className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Download CSV Template</h3>
              <p className="text-sm text-blue-700">
                Get the CSV template with the correct format for bulk resource planning import.
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-600">
              Select a CSV file containing resource planning data to import.
            </p>
          </div>

          {/* Validation Results */}
          {file && validationResult && (
            <BulkResourcePlanningCSVValidation
              validationResult={validationResult}
              fileName={file.name}
            />
          )}

          {/* Import Actions */}
          {validationResult?.valid.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-2">Ready to Import</h3>
              <p className="text-sm text-green-700 mb-4">
                This will create {validationResult.valid.length} new resource planning assignments.
              </p>
              <Button 
                onClick={handleBulkImport} 
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isProcessing ? 'Importing...' : `Import ${validationResult.valid.length} Records`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
