import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportJobTypesToCSV, downloadJobTypeCSVTemplate } from '@/utils/jobTypeCsvUtils';
import { JobTypeItem } from '@/hooks/use-job-type-settings';
import JobTypeImportDialog from './JobTypeImportDialog';

interface JobTypeCSVManagerProps {
  jobTypes: JobTypeItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
}

const JobTypeCSVManager: React.FC<JobTypeCSVManagerProps> = ({
  jobTypes,
  onValidationResult,
  isBulkImporting
}) => {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleExport = () => {
    try {
      exportJobTypesToCSV(jobTypes);
      toast({
        title: "Export successful",
        description: "Job types have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export job types to CSV.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadJobTypeCSVTemplate();
      toast({
        title: "Template downloaded",
        description: "CSV template has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download CSV template.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport} disabled={jobTypes.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" onClick={handleDownloadTemplate}>
        <Download className="mr-2 h-4 w-4" />
        Template
      </Button>
      <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </Button>
      <JobTypeImportDialog
        jobTypes={jobTypes}
        onValidationResult={onValidationResult}
        isBulkImporting={isBulkImporting}
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};

export default JobTypeCSVManager;