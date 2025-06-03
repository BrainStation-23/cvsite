
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportSbusToCSV } from '@/utils/sbuCsvUtils';
import { SbuItem } from '@/hooks/use-sbu-settings';
import SbuImportDialog from './SbuImportDialog';

interface SbuCSVManagerProps {
  sbus: SbuItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
}

const SbuCSVManager: React.FC<SbuCSVManagerProps> = ({
  sbus,
  onValidationResult,
  isBulkImporting
}) => {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const safeSbus = sbus || [];

  const handleExport = () => {
    try {
      exportSbusToCSV(safeSbus);
      toast({
        title: "Export successful",
        description: "SBUs have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export SBUs to CSV.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport} disabled={safeSbus.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <SbuImportDialog
        sbus={safeSbus}
        onValidationResult={onValidationResult}
        isBulkImporting={isBulkImporting}
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};

export default SbuCSVManager;
