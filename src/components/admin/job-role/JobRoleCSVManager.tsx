import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportJobRolesToCSV, downloadJobRoleCSVTemplate } from '@/utils/jobRoleCsvUtils';
import { JobRoleItem } from '@/hooks/use-job-role-settings';
import JobRoleImportDialog from './JobRoleImportDialog';

interface JobRoleCSVManagerProps {
  jobRoles: JobRoleItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
}

const JobRoleCSVManager: React.FC<JobRoleCSVManagerProps> = ({
  jobRoles,
  onValidationResult,
  isBulkImporting
}) => {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleExport = () => {
    try {
      exportJobRolesToCSV(jobRoles);
      toast({
        title: "Export successful",
        description: "Job roles have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export job roles to CSV.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadJobRoleCSVTemplate();
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
      <Button variant="outline" onClick={handleExport} disabled={jobRoles.length === 0}>
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
      <JobRoleImportDialog
        jobRoles={jobRoles}
        onValidationResult={onValidationResult}
        isBulkImporting={isBulkImporting}
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};

export default JobRoleCSVManager;