
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportUniversitiesToCSV, parseUniversitiesCSV } from '@/utils/csvUtils';
import { UniversityItem, UniversityFormData } from '@/hooks/use-university-settings';

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
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const universities = await parseUniversitiesCSV(file);
      onImport(universities);
      toast({
        title: "Import successful",
        description: `${universities.length} universities ready to import.`,
      });
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

  return (
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
  );
};

export default UniversityCSVManager;
