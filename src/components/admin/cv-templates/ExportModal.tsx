
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  FileImage, 
  Presentation, 
  Code, 
  File, 
  Database,
  FileSpreadsheet,
  FileCode,
  Download,
  Clock
} from 'lucide-react';
import { ExportFormat, CVExportService, ExportCategory } from '@/services/cv-export/CVExportService';
import { useCVExport } from '@/hooks/use-cv-export';

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
  profile: any;
  sections: any[];
  fieldMappings: any[];
  styles: any;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onOpenChange,
  template,
  profile,
  sections,
  fieldMappings,
  styles
}) => {
  const { exportCV, isExporting, exportFormat } = useCVExport();

  const handleExport = async (format: ExportFormat) => {
    const result = await exportCV({
      format,
      template,
      profile,
      sections,
      fieldMappings,
      styles
    });
    
    if (result.success) {
      onOpenChange(false);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    const iconProps = { className: "h-8 w-8" };
    
    switch (format) {
      case 'pdf':
        return <FileText {...iconProps} />;
      case 'docx':
        return <FileImage {...iconProps} />;
      case 'ppt':
        return <Presentation {...iconProps} />;
      case 'html':
        return <Code {...iconProps} />;
      case 'txt':
        return <File {...iconProps} />;
      case 'json':
        return <Database {...iconProps} />;
      case 'excel':
        return <FileSpreadsheet {...iconProps} />;
      case 'markdown':
        return <FileCode {...iconProps} />;
      default:
        return <Download {...iconProps} />;
    }
  };

  const categories = CVExportService.getExportCategories();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <Download className="h-6 w-6" />
            Export CV
          </DialogTitle>
          <DialogDescription>
            Choose your preferred export format. Each format is optimized for different use cases.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {categories.map((category) => (
            <div key={category.id} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.formats.map((formatInfo) => (
                  <div
                    key={formatInfo.format}
                    className="relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="text-blue-600 dark:text-blue-400">
                        {getFormatIcon(formatInfo.format)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {formatInfo.name}
                          </h4>
                          {formatInfo.comingSoon && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Soon
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {formatInfo.description}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={formatInfo.available ? "default" : "secondary"}
                        disabled={!formatInfo.available || isExporting || !profile}
                        onClick={() => formatInfo.available && handleExport(formatInfo.format)}
                        className="w-full"
                      >
                        {isExporting && exportFormat === formatInfo.format ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Exporting...
                          </div>
                        ) : formatInfo.available ? (
                          <div className="flex items-center gap-2">
                            <Download className="h-3 w-3" />
                            Export
                          </div>
                        ) : (
                          "Coming Soon"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!profile && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Please select an employee profile to enable export functionality.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
