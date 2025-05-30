
import { useState } from 'react';
import { CVExportService, ExportFormat, ExportOptions } from '@/services/cv-export/CVExportService';
import { useToast } from '@/hooks/use-toast';

export const useCVExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);
  const { toast } = useToast();

  const exportCV = async (options: ExportOptions) => {
    setIsExporting(true);
    setExportFormat(options.format);

    try {
      const result = await CVExportService.export(options);
      
      if (result.success) {
        toast({
          title: "Export Successful",
          description: `CV exported as ${options.format.toUpperCase()} successfully`
        });
      } else {
        toast({
          title: "Export Failed",
          description: result.error || "An error occurred during export",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const getSupportedFormats = () => CVExportService.getSupportedFormats();
  const getFormatLabel = (format: ExportFormat) => CVExportService.getFormatLabel(format);

  return {
    exportCV,
    isExporting,
    exportFormat,
    getSupportedFormats,
    getFormatLabel
  };
};
