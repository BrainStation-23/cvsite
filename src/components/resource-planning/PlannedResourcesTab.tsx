
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { ResourcePlanningTableHeader } from './ResourcePlanningTableHeader';
import { ResourcePlanningTableRow } from './ResourcePlanningTableRow';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';
import { ResourcePlanningBulkActionsToolbar } from './ResourcePlanningBulkActionsToolbar';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import { useResourcePlanningOperations } from '@/hooks/use-resource-planning-operations';

interface PlannedResourcesTabProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  onCreateNewAssignment: () => void;
  onEditAssignment: (item: any) => void;
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

export const PlannedResourcesTab: React.FC<PlannedResourcesTabProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  onCreateNewAssignment,
  onEditAssignment,
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
  } = resourcePlanningState;

  const {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
    selectedCount
  } = useBulkSelection(data);

  const {
    bulkDeleteResourcePlanning,
    bulkCompleteEngagements,
    isBulkDeleting,
    isBulkCompleting,
  } = useResourcePlanningOperations();

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteResourcePlanning(ids);
  };

  const handleBulkComplete = (ids: string[]) => {
    bulkCompleteEngagements(ids);
  };

  const handleBulkExport = (ids: string[]) => {
    // Get selected items data
    const selectedData = data.filter((item: any) => ids.includes(item.id));
    
    // Create CSV content
    const headers = [
      'Employee Name',
      'Employee ID',
      'Bill Type',
      'Project',
      'Client',
      'Engagement %',
      'Billing %',
      'Start Date',
      'Release Date'
    ];
    
    const csvRows = selectedData.map((item: any) => [
      `${item.profile.first_name} ${item.profile.last_name}`,
      item.profile.employee_id,
      item.bill_type?.name || 'Not specified',
      item.project?.project_name || 'Not assigned',
      item.project?.client_name || 'N/A',
      item.engagement_percentage,
      item.billing_percentage || 0,
      item.engagement_start_date || 'Not set',
      item.release_date || 'Not set'
    ]);
    
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `planned-resources-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading resource planning data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasSelection && (
        <ResourcePlanningBulkActionsToolbar
          selectedCount={selectedCount}
          selectedItems={selectedItems}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
          onBulkComplete={handleBulkComplete}
          onBulkExport={handleBulkExport}
          isLoading={isBulkDeleting || isBulkCompleting}
          mode="planned"
        />
      )}

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No resource planning entries found. Use the form on the right to create your first assignment.
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <ResourcePlanningTableHeader 
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                showBulkSelection={true}
                selectedCount={selectedCount}
                totalCount={data.length}
                onSelectAll={selectAll}
              />
              <TableBody>
                {data.map((item: any) => (
                  <ResourcePlanningTableRow 
                    key={item.id} 
                    item={item} 
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
