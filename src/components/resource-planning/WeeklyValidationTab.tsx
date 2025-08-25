
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { ResourcePlanningTableHeader } from './ResourcePlanningTableHeader';
import { WeeklyValidationTableRow } from './WeeklyValidationTableRow';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface WeeklyValidationTabProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  // Centralized resource planning state
  resourcePlanningState: any;
  // Inline edit props
  editingItemId: string | null;
  editData: any;
  onStartEdit: (item: any) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditDataChange: (data: any) => void;
  editLoading: boolean;
}

export const WeeklyValidationTab: React.FC<WeeklyValidationTabProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  resourcePlanningState,
  editingItemId,
  editData,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDataChange,
  editLoading,
}) => {
  const {
    data,
    pagination,
    isLoading,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    validateWeekly,
    isValidating,
    bulkValidate,
    bulkComplete,
    bulkDelete,
    bulkCopy,
    isBulkValidating,
    isBulkCompleting,
    isBulkDeleting,
    isBulkCopying,
  } = resourcePlanningState;

  // Bulk selection
  const {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
    isIndeterminate,
    selectedCount
  } = useBulkSelection(data);

  // Confirmation dialog
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleBulkComplete = () => {
    showConfirmation({
      title: 'Mark Engagements as Complete',
      description: `Are you sure you want to mark ${selectedCount} engagement${selectedCount !== 1 ? 's' : ''} as complete? This action cannot be undone.`,
      confirmText: 'Complete',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: () => {
        bulkComplete(selectedItems);
        clearSelection();
      }
    });
  };

  const handleBulkValidate = () => {
    showConfirmation({
      title: 'Validate Weekly Data',
      description: `Are you sure you want to validate ${selectedCount} resource assignment${selectedCount !== 1 ? 's' : ''} for this week? This action cannot be undone.`,
      confirmText: 'Validate',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: () => {
        bulkValidate(selectedItems);
        clearSelection();
      }
    });
  };

  const handleBulkDelete = () => {
    showConfirmation({
      title: 'Delete Resource Assignments',
      description: `Are you sure you want to delete ${selectedCount} resource assignment${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: () => {
        bulkDelete(selectedItems);
        clearSelection();
      }
    });
  };

  const handleBulkCopy = () => {
    showConfirmation({
      title: 'Copy Resource Assignments',
      description: `This will create ${selectedCount} new resource assignment${selectedCount !== 1 ? 's' : ''} with the same information. You can edit them after creation.`,
      confirmText: 'Copy',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: () => {
        bulkCopy(selectedItems);
        clearSelection();
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading weekly validation data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No pending weekly validations found. All resource assignments have been validated.
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <BulkActionsToolbar
              selectedCount={selectedCount}
              onBulkComplete={handleBulkComplete}
              onBulkValidate={handleBulkValidate}
              onBulkDelete={handleBulkDelete}
              onBulkCopy={handleBulkCopy}
              onClearSelection={clearSelection}
              showValidate={true}
            />
            
            <Table>
              <ResourcePlanningTableHeader 
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                showBulkSelection={true}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                onSelectAll={selectAll}
              />
              <TableBody>
                {data.map((item: any) => (
                  <WeeklyValidationTableRow 
                    key={item.id} 
                    item={item} 
                    onValidate={validateWeekly}
                    isValidating={isValidating}
                    isEditing={editingItemId === item.id}
                    editData={editData}
                    onStartEdit={onStartEdit}
                    onCancelEdit={onCancelEdit}
                    onSaveEdit={onSaveEdit}
                    onEditDataChange={onEditDataChange}
                    editLoading={editLoading}
                    showBulkSelection={true}
                    isSelected={selectedItems.includes(item.id)}
                    onSelect={selectItem}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && (
            <ResourcePlanningPagination 
              pagination={pagination}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}

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
    </div>
  );
};
