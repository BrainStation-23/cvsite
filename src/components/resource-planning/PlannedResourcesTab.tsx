
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { ResourcePlanningTableHeader } from './ResourcePlanningTableHeader';
import { ResourcePlanningTableRow } from './ResourcePlanningTableRow';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';

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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
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
