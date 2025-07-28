
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { useInlineEdit } from './hooks/useInlineEdit';
import { ResourcePlanningTableHeader } from './ResourcePlanningTableHeader';
import { ResourcePlanningTableRow } from './ResourcePlanningTableRow';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';

interface PlannedResourcesTabProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  onCreateNewAssignment: () => void;
  onEditAssignment: (item: any) => void;
}

export const PlannedResourcesTab: React.FC<PlannedResourcesTabProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  onCreateNewAssignment,
  onEditAssignment,
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
    setSearchQuery,
    setSelectedSbu,
    setSelectedManager,
  } = usePlannedResources();

  const {
    editingItemId,
    editData,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditData,
    isLoading: editLoading,
  } = useInlineEdit();

  // Sync filters when props change
  React.useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);

  React.useEffect(() => {
    setSelectedSbu(selectedSbu);
  }, [selectedSbu, setSelectedSbu]);

  React.useEffect(() => {
    setSelectedManager(selectedManager);
  }, [selectedManager, setSelectedManager]);

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
      <div className="flex justify-between items-center">
        <div></div>
        <Button onClick={onCreateNewAssignment}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No resource planning entries found. Create your first assignment to get started.
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
                {data.map((item) => (
                  <ResourcePlanningTableRow 
                    key={item.id} 
                    item={item} 
                    isEditing={editingItemId === item.id}
                    editData={editData}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onEditDataChange={updateEditData}
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
