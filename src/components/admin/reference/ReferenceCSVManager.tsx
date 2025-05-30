
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import { exportReferencesToCSV } from '@/utils/referenceCsvUtils';
import { ReferenceItem } from '@/hooks/settings/use-reference-settings';
import ReferenceImportDialog from './ReferenceImportDialog';

interface ReferenceCSVManagerProps {
  references: ReferenceItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
}

const ReferenceCSVManager: React.FC<ReferenceCSVManagerProps> = ({
  references,
  onValidationResult,
  isBulkImporting
}) => {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const safeReferences = references || [];

  const handleExport = () => {
    try {
      exportReferencesToCSV(safeReferences);
      toast({
        title: "Export successful",
        description: "References have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export references to CSV.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport} disabled={safeReferences.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <ReferenceImportDialog
        references={safeReferences}
        onValidationResult={onValidationResult}
        isBulkImporting={isBulkImporting}
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};

export default ReferenceCSVManager;
