
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportItemsToCSV, ENTITY_NAMES } from '@/utils/resourcePlanningCsvUtils';
import { ResourcePlanningBulkImport } from './ResourcePlanningBulkImport';
import { SettingTableName } from '@/hooks/use-platform-settings';

interface ResourcePlanningCSVManagerProps {
  tableName: SettingTableName;
  items: any[];
  onBulkCreate: (items: { name: string }[]) => Promise<void>;
  onBulkUpdate: (items: { id: string; name: string }[]) => Promise<void>;
}

export const ResourcePlanningCSVManager: React.FC<ResourcePlanningCSVManagerProps> = ({
  tableName,
  items,
  onBulkCreate,
  onBulkUpdate
}) => {
  const { toast } = useToast();
  const [showImportDialog, setShowImportDialog] = useState(false);

  const entityName = ENTITY_NAMES[tableName];

  const handleExport = () => {
    if (items.length === 0) {
      toast({
        title: 'No data to export',
        description: `There are no ${entityName.toLowerCase()}s to export.`,
        variant: 'destructive'
      });
      return;
    }

    exportItemsToCSV(items, tableName);
    toast({
      title: 'Export successful',
      description: `${items.length} ${entityName.toLowerCase()}s exported to CSV.`
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowImportDialog(true)}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="flex items-center gap-2"
      >
        <FileDown className="h-4 w-4" />
        Export CSV
      </Button>

      <ResourcePlanningBulkImport
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        tableName={tableName}
        existingItems={items}
        onBulkCreate={onBulkCreate}
        onBulkUpdate={onBulkUpdate}
      />
    </div>
  );
};
