
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, CheckCircle2, Copy, XCircle } from 'lucide-react';
import { ResourcePlanningExportButton } from './ResourcePlanningExportButton';
import { useResourcePlanningPermissions } from '@/hooks/use-resource-planning-permissions';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkComplete: () => void;
  onBulkValidate?: () => void;
  onBulkInvalidate?: () => void;
  onBulkCopy: () => void;
  onClearSelection: () => void;
  showValidate?: boolean;
  showInvalidate?: boolean;
  selectedItems: any[]; 
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkComplete,
  onBulkValidate,
  onBulkInvalidate,
  onBulkCopy,
  onClearSelection,
  showValidate = false,
  showInvalidate = false,
  selectedItems
}) => {
  const permissions = useResourcePlanningPermissions();
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
     
      <span className="text-sm font-medium text-muted-foreground">
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>
      
      <div className="flex items-center gap-2">
        {permissions.canRead && <ResourcePlanningExportButton selectedItems={selectedItems} />}
        
        {permissions.showCompleteButton && <Button
          variant="outline"
          size="sm"
          onClick={onBulkComplete}
          className="h-8 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
        >
          <CheckCircle className="h-4 w-4 mr-1.5" />
          Complete
        </Button>}

        {permissions.showDuplicateButton && <Button
          variant="outline"
          size="sm"
          onClick={onBulkCopy}
          className="h-8"
        >
          <Copy className="h-4 w-4 mr-1.5" />
          Copy
        </Button>
        }

        {showValidate && onBulkValidate && permissions.canUpdate && <Button
            variant="outline"
            size="sm"
            onClick={onBulkValidate}
            className="h-8"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Validate
          </Button>
        }

        {showInvalidate && onBulkInvalidate && permissions.canUpdate &&  <Button
            variant="outline"
            size="sm"
            onClick={onBulkInvalidate}
            className="h-8 text-orange-700 border-orange-200 hover:bg-orange-50"
          >
            <XCircle className="h-4 w-4 mr-1.5" />
            Invalidate
          </Button>
        }
        
        {permissions.showDeleteButton && <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="h-8 text-destructive border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete
        </Button>
       }
      </div>
    </div>
  );
};
