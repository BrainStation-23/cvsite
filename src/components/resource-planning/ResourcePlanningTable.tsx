
import React from 'react';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useInlineEdit } from './hooks/useInlineEdit';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { ResourcePlanningTableView } from './ResourcePlanningTableView';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { UnplannedResourcesTable } from './UnplannedResourcesTable';

export const ResourcePlanningTable: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    showUnplanned,
    setShowUnplanned,
    clearFilters,
    data,
  } = useResourcePlanning();

  const {
    showCreateForm,
    preselectedProfileId,
    editingItem,
    handleCreatePlan,
    handleCreateNewAssignment,
    handleEditAssignment,
    handleFormSuccess,
    handleFormCancel,
  } = useResourcePlanningState();

  const {
    editingItemId,
    editData,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditData,
    isLoading: editLoading,
  } = useInlineEdit();

  const plannedResources = usePlannedResources();
  const unplannedResources = useUnplannedResources({
    searchQuery,
    selectedSbu,
    selectedManager,
  });

  // Override the edit handler to use inline editing instead
  const handleInlineEdit = (item: any) => {
    startEdit(item);
  };

  return (
    <div className="space-y-6">
      <ResourcePlanningFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSbu={selectedSbu}
        setSelectedSbu={setSelectedSbu}
        selectedManager={selectedManager}
        setSelectedManager={setSelectedManager}
        clearFilters={clearFilters}
        onCreateNew={handleCreateNewAssignment}
      />

      <ResourcePlanningTabs
        showUnplanned={showUnplanned}
        setShowUnplanned={setShowUnplanned}
        plannedCount={data?.length || 0}
        unplannedCount={unplannedResources.data?.length || 0}
      />

      {showCreateForm && (
        <ResourcePlanningForm
          preselectedProfileId={preselectedProfileId}
          editingItem={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {showUnplanned ? (
        <UnplannedResourcesTable
          data={unplannedResources.data || []}
          isLoading={unplannedResources.isLoading}
          onCreatePlan={handleCreatePlan}
        />
      ) : (
        <ResourcePlanningTableView
          data={plannedResources.data}
          pagination={plannedResources.pagination}
          isLoading={plannedResources.isLoading}
          onEdit={handleInlineEdit} // Use inline edit instead
          // Inline edit props
          editingItemId={editingItemId}
          editData={editData}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onEditDataChange={updateEditData}
          editLoading={editLoading}
          // Pagination props
          currentPage={plannedResources.currentPage}
          setCurrentPage={plannedResources.setCurrentPage}
          sortBy={plannedResources.sortBy}
          setSortBy={plannedResources.setSortBy}
          sortOrder={plannedResources.sortOrder}
          setSortOrder={plannedResources.setSortOrder}
        />
      )}
    </div>
  );
};
