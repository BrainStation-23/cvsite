
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { ResourcePlanningTableHeader } from './ResourcePlanningTableHeader';
import { WeeklyValidationTableRow } from './WeeklyValidationTableRow';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { useBulkSelection } from '@/hooks/use-bulk-selection';

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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Placeholder bulk operations
  const handleBulkComplete = () => {
    console.log('Bulk complete for items:', selectedItems);
    // TODO: Implement bulk complete operation
  };

  const handleBulkValidate = () => {
    console.log('Bulk validate for items:', selectedItems);
    // TODO: Implement bulk validate operation
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete for items:', selectedItems);
    // TODO: Implement bulk delete operation
  };

  const handleBulkCopy = () => {
    console.log('Bulk copy for items:', selectedItems);
    // TODO: Implement bulk copy operation
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
    </div>
  );
};
