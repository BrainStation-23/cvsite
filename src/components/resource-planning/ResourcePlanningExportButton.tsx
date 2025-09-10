import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { usePlannedResourcesExport } from '@/hooks/use-planned-resources-export';

interface ResourcePlanningExportButtonProps {
  selectedItems?: any[];
}

export const ResourcePlanningExportButton: React.FC<ResourcePlanningExportButtonProps> = ({ selectedItems }) => {
  const { exportPlannedResources, isExporting } = usePlannedResourcesExport();

  return (
    <Button
      onClick={() => exportPlannedResources(selectedItems)}
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
