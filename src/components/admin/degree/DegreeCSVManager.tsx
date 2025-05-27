
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportDegreesToCSV } from '@/utils/degreeCsvUtils';
import { DegreeItem } from '@/utils/degreeCsvUtils';
import DegreeImportDialog from './DegreeImportDialog';

interface DegreeCSVManagerProps {
  degrees: DegreeItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
}

const DegreeCSVManager: React.FC<DegreeCSVManagerProps> = ({
  degrees,
  onValidationResult,
  isBulkImporting
}) => {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleExport = () => {
    try {
      exportDegreesToCSV(degrees);
      toast({
        title: "Export successful",
        description: "Degrees have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export degrees to CSV.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport} disabled={degrees.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <DegreeImportDialog
        degrees={degrees}
        onValidationResult={onValidationResult}
        isBulkImporting={isBulkImporting}
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};

export default DegreeCSVManager;
