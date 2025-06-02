
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileImage, Presentation, Code, File } from 'lucide-react';
import { ExportFormat } from '@/services/cv-export/CVExportService';
import { useCVExport } from '@/hooks/use-cv-export';

interface ExportDropdownProps {
  template: any;
  profile: any;
  sections: any[];
  fieldMappings: any[];
  styles: any;
  disabled?: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  template,
  profile,
  sections,
  fieldMappings,
  styles,
  disabled = false
}) => {
  const { exportCV, isExporting, exportFormat, getSupportedFormats, getFormatLabel } = useCVExport();

  const handleExport = async (format: ExportFormat) => {
    await exportCV({
      format,
      template,
      profile,
      sections,
      fieldMappings,
      styles
    });
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'docx':
        return <FileImage className="h-4 w-4" />;
      case 'ppt':
        return <Presentation className="h-4 w-4" />;
      case 'html':
        return <Code className="h-4 w-4" />;
      case 'txt':
        return <File className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm"
          disabled={disabled || isExporting || !profile}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? `Exporting ${exportFormat?.toUpperCase()}...` : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {getSupportedFormats().map((format) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            disabled={isExporting}
            className="flex items-center gap-2 cursor-pointer"
          >
            {getFormatIcon(format)}
            <span>{getFormatLabel(format)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropdown;
