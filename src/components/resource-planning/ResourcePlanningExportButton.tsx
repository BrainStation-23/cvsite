
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { usePlannedResourcesExport } from '@/hooks/use-planned-resources-export';

export const ResourcePlanningExportButton: React.FC = () => {
  const { exportPlannedResources, isExporting } = usePlannedResourcesExport();

  return (
    <Button
      onClick={exportPlannedResources}
      variant="outline"
      size="sm"
      disabled={isExporting}
      className="flex items-center gap-2"
    >
      <FileDown className="h-4 w-4" />
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
};
