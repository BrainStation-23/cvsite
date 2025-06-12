
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { HrContactItem } from '@/hooks/use-hr-contact-settings';
import { exportHrContactsToCSV, downloadHrContactCSVTemplate } from '@/utils/hrContactCsvUtils';
import HrContactImportDialog from './HrContactImportDialog';

interface HrContactCSVManagerProps {
  hrContacts: HrContactItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
}

const HrContactCSVManager: React.FC<HrContactCSVManagerProps> = ({
  hrContacts,
  onValidationResult,
  isBulkImporting
}) => {
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleExport = () => {
    exportHrContactsToCSV(hrContacts);
  };

  const handleDownloadTemplate = () => {
    downloadHrContactCSVTemplate();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowImportDialog(true)}
        disabled={isBulkImporting}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import CSV
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={!hrContacts || hrContacts.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadTemplate}
      >
        <Download className="h-4 w-4 mr-2" />
        Template
      </Button>

      <HrContactImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onValidationResult={onValidationResult}
        existingHrContacts={hrContacts}
        isImporting={isBulkImporting}
      />
    </div>
  );
};

export default HrContactCSVManager;
