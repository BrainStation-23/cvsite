
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, CheckCircle, FileText, X, Download } from 'lucide-react';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface ResourcePlanningBulkActionsToolbarProps {
  selectedCount: number;
  selectedItems: string[];
  onClearSelection: () => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkComplete?: (ids: string[]) => void;
  onBulkValidate?: (ids: string[]) => void;
  onBulkExport?: (ids: string[]) => void;
  isLoading?: boolean;
  mode: 'planned' | 'validation';
}

export const ResourcePlanningBulkActionsToolbar: React.FC<ResourcePlanningBulkActionsToolbarProps> = ({
  selectedCount,
  selectedItems,
  onClearSelection,
  onBulkDelete,
  onBulkComplete,
  onBulkValidate,
  onBulkExport,
  isLoading = false,
  mode,
}) => {
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleBulkDelete = () => {
    showConfirmation({
      title: 'Delete Selected Assignments',
      description: `Are you sure you want to delete ${selectedCount} resource assignment${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: () => {
        onBulkDelete(selectedItems);
        onClearSelection();
      }
    });
  };

  const handleBulkComplete = () => {
    if (!onBulkComplete) return;
    showConfirmation({
      title: 'Complete Selected Engagements',
      description: `Are you sure you want to mark ${selectedCount} engagement${selectedCount > 1 ? 's' : ''} as complete?`,
      confirmText: 'Complete All',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: () => {
        onBulkComplete(selectedItems);
        onClearSelection();
      }
    });
  };

  const handleBulkValidate = () => {
    if (!onBulkValidate) return;
    showConfirmation({
      title: 'Validate Selected Items',
      description: `Are you sure you want to mark ${selectedCount} item${selectedCount > 1 ? 's' : ''} as validated for this week?`,
      confirmText: 'Validate All',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: () => {
        onBulkValidate(selectedItems);
        onClearSelection();
      }
    });
  };

  const handleBulkExport = () => {
    if (!onBulkExport) return;
    onBulkExport(selectedItems);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-medium">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-7 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'validation' && onBulkValidate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkValidate}
                disabled={isLoading}
                className="h-7 px-3"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Validate All
              </Button>
              <Separator orientation="vertical" className="h-4" />
            </>
          )}

          {mode === 'planned' && onBulkComplete && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkComplete}
                disabled={isLoading}
                className="h-7 px-3"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete All
              </Button>
              <Separator orientation="vertical" className="h-4" />
            </>
          )}

          {onBulkExport && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
                disabled={isLoading}
                className="h-7 px-3"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Separator orientation="vertical" className="h-4" />
            </>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isLoading}
            className="h-7 px-3"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete All
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config?.title || ''}
        description={config?.description || ''}
        confirmText={config?.confirmText}
        cancelText={config?.cancelText}
        variant={config?.variant}
      />
    </>
  );
};
