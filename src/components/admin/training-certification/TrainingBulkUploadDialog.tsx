
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseTrainingCSV, validateTrainingCSVData, downloadTrainingCSVTemplate, type TrainingCSVValidationResult } from '@/utils/trainingCsvUtils';
import { supabase } from '@/integrations/supabase/client';

interface TrainingBulkUploadDialogProps {
  onUploadComplete: () => void;
}

export const TrainingBulkUploadDialog: React.FC<TrainingBulkUploadDialogProps> = ({ onUploadComplete }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<TrainingCSVValidationResult | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please select a CSV file',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);

    try {
      const data = await parseTrainingCSV(selectedFile);
      const validation = await validateTrainingCSVData(data);
      setValidationResult(validation);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse CSV file',
        variant: 'destructive'
      });
    }
  };

  const handleUpload = async () => {
    if (!validationResult?.valid.length) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < validationResult.valid.length; i += batchSize) {
        batches.push(validationResult.valid.slice(i, i + batchSize));
      }

      let processed = 0;
      let successful = 0;
      const errors: string[] = [];

      for (const batch of batches) {
        const promises = batch.map(async (training) => {
          try {
            // First, find the profile by employee_id
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('employee_id', training.employee_id)
              .single();

            if (profileError || !profile) {
              throw new Error(`Employee ID ${training.employee_id} not found`);
            }

            // Insert training record
            const { error: insertError } = await supabase
              .from('trainings')
              .insert({
                profile_id: profile.id,
                title: training.title,
                provider: training.provider || 'Unknown',
                certification_date: training.certification_date,
                description: training.description || null,
                certificate_url: training.certificate_url || null,
                is_renewable: training.is_renewable,
                expiry_date: training.expiry_date || null
              });

            if (insertError) throw insertError;
            return { success: true, employee_id: training.employee_id };
          } catch (error) {
            return { 
              success: false, 
              employee_id: training.employee_id, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };
          }
        });

        const results = await Promise.all(promises);
        
        results.forEach(result => {
          if (result.success) {
            successful++;
          } else {
            errors.push(`Employee ${result.employee_id}: ${result.error}`);
          }
        });

        processed += batch.length;
        setUploadProgress((processed / validationResult.valid.length) * 100);
      }

      toast({
        title: 'Upload Complete',
        description: `${successful} training records uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
        variant: successful > 0 ? 'default' : 'destructive'
      });

      if (successful > 0) {
        onUploadComplete();
        setIsOpen(false);
      }

    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'An error occurred during upload',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setValidationResult(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Training Certifications</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Download CSV Template</p>
              <p className="text-xs text-gray-600">Get the template with correct format and sample data</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTrainingCSVTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-3">
              {validationResult.valid.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>{validationResult.valid.length}</strong> valid training records ready for upload
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{validationResult.errors.length}</strong> validation errors found:
                    <ul className="mt-2 max-h-32 overflow-y-auto">
                      {validationResult.errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="text-xs">
                          Row {error.row}: {error.message}
                        </li>
                      ))}
                      {validationResult.errors.length > 10 && (
                        <li className="text-xs font-medium">
                          ... and {validationResult.errors.length - 10} more errors
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!validationResult?.valid.length || isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${validationResult?.valid.length || 0} Records`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
