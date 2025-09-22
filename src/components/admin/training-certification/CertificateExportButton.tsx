import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useCertificationExport } from '@/hooks/use-certification-export';

interface CertificationExportButtonProps {
  selectedItems?: any[];
}

export const CertificationExportButton: React.FC<CertificationExportButtonProps> = ({ selectedItems }) => {
  const { exportCertifications, isExporting } = useCertificationExport();

  return (
    <Button
      onClick={() => exportCertifications()}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
};
