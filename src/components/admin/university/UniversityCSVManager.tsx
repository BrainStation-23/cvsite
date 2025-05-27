
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportUniversitiesToCSV, parseUniversitiesCSV, validateCSVData } from '@/utils/csvUtils';
import { UniversityItem, UniversityFormData } from '@/hooks/use-university-settings';
import UniversityImportDialog from './UniversityImportDialog';
import UniversityCSVValidation from './UniversityCSVValidation';

interface UniversityCSVManagerProps {
  universities: UniversityItem[];
  onImport: (universities: UniversityFormData[]) => void;
  isImporting?: boolean;
}

const UniversityCSVManager: React.FC<UniversityCSVManagerProps> = ({
  universities,
  onImport,
  isImporting = false
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleExport = () => {
    try {
      exportUniversitiesToCSV(universities);
      toast({
        title: "Export successful",
        description: "Universities have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export universities to CSV.",
        variant: "destructive"
      });
    }
  };

  const handleImportClick = () => {
    setShowImportDialog(true);
  };

  const handleProceedToImport = () => {
    setShowImportDialog(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseUniversitiesCSV(file);
      
      if (parsedData.length === 0) {
        toast({
          title: "Import failed",
          description: "No valid data found in CSV file.",
          variant: "destructive"
        });
        return;
      }

      // Validate the data
      const validation = validateCSVData(parsedData, universities);
      setValidationResult(validation);

      if (validation.errors.length === 0) {
        toast({
          title: "Validation successful",
          description: `${validation.valid.length} universities ready to import.`,
        });
      } else {
        toast({
          title: "Validation completed",
          description: `Found ${validation.errors.length} errors and ${validation.valid.length} valid entries.`,
          variant: validation.valid.length > 0 ? "default" : "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleValidationProceed = (validUniversities: UniversityFormData[]) => {
    onImport(validUniversities);
    setValidationResult(null);
  };

  const handleValidationCancel = () => {
    setValidationResult(null);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleExport} disabled={universities.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        
        <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
          <Upload className="mr-2 h-4 w-4" />
          {isImporting ? "Importing..." : "Import CSV"}
        </Button>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {validationResult && (
        <UniversityCSVValidation
          validationResult={validationResult}
          onProceed={handleValidationProceed}
          onCancel={handleValidationCancel}
          isImporting={isImporting}
        />
      )}

      <UniversityImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onProceedToImport={handleProceedToImport}
      />
    </>
  );
};

export default UniversityCSVManager;
