
import React from 'react';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useInlineEdit } from './hooks/useInlineEdit';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { ResourcePlanningForm } from './ResourcePlanningForm';

export const ResourcePlanningTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSbu, setSelectedSbu] = React.useState<string | null>(null);
  const [selectedManager, setSelectedManager] = React.useState<string | null>(null);
  const [showUnplanned, setShowUnplanned] = React.useState(false);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
  };

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

  // Centralized data fetching with current filters
  const plannedResources = usePlannedResources();
  const unplannedResources = useUnplannedResources({
    searchQuery,
    selectedSbu,
    selectedManager,
  });

  // Sync filters to planned resources hook
  React.useEffect(() => {
    plannedResources.setSearchQuery(searchQuery);
  }, [searchQuery, plannedResources.setSearchQuery]);

  React.useEffect(() => {
    plannedResources.setSelectedSbu(selectedSbu);
  }, [selectedSbu, plannedResources.setSelectedSbu]);

  React.useEffect(() => {
    plannedResources.setSelectedManager(selectedManager);
  }, [selectedManager, plannedResources.setSelectedManager]);

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
        plannedCount={plannedResources.data?.length || 0}
        unplannedCount={unplannedResources.unplannedResources?.length || 0}
        searchQuery={searchQuery}
        selectedSbu={selectedSbu}
        selectedManager={selectedManager}
        onCreateNewAssignment={handleCreateNewAssignment}
        onEditAssignment={handleInlineEdit}
        onCreatePlan={handleCreatePlan}
        // Pass centralized data to tabs
        plannedResources={plannedResources}
        unplannedResources={unplannedResources}
        // Pass inline edit props
        editingItemId={editingItemId}
        editData={editData}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        onSaveEdit={saveEdit}
        onEditDataChange={updateEditData}
        editLoading={editLoading}
      />

      {showCreateForm && (
        <ResourcePlanningForm
          preselectedProfileId={preselectedProfileId}
          editingItem={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};
