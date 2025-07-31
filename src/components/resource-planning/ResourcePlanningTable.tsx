
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useCentralizedResourcePlanning } from '@/hooks/use-centralized-resource-planning';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useInlineEditStable } from './hooks/useInlineEditStable';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { AdvancedResourceFilters } from './AdvancedResourceFilters';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { BulkResourcePlanningImport } from './BulkResourcePlanningImport';

export const ResourcePlanningTable: React.FC = () => {
  const [showBulkImport, setShowBulkImport] = React.useState(false);

  // Use centralized resource planning hook
  const resourcePlanningState = useCentralizedResourcePlanning();

  const {
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
  } = useInlineEditStable();

  const handleBulkImportSuccess = () => {
    resourcePlanningState.setSearchQuery('');
    resourcePlanningState.refetch();
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Resource Planning</h2>
          <Button
            variant="outline"
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
        </div>

        <ResourcePlanningFilters
          searchQuery={resourcePlanningState.searchQuery}
          setSearchQuery={resourcePlanningState.setSearchQuery}
          selectedSbu={resourcePlanningState.selectedSbu}
          setSelectedSbu={resourcePlanningState.setSelectedSbu}
          selectedManager={resourcePlanningState.selectedManager}
          setSelectedManager={resourcePlanningState.setSelectedManager}
          clearFilters={resourcePlanningState.clearBasicFilters}
        >
          <AdvancedResourceFilters
            filters={resourcePlanningState.advancedFilters}
            onFiltersChange={resourcePlanningState.setAdvancedFilters}
            onClearFilters={resourcePlanningState.clearAdvancedFilters}
          />
        </ResourcePlanningFilters>

        <ResourcePlanningTabs
          activeTab={resourcePlanningState.activeTab}
          setActiveTab={resourcePlanningState.setActiveTab}
          searchQuery={resourcePlanningState.searchQuery}
          selectedSbu={resourcePlanningState.selectedSbu}
          selectedManager={resourcePlanningState.selectedManager}
          onCreateNewAssignment={handleCreateNewAssignment}
          onEditAssignment={startEdit}
          onCreatePlan={handleCreatePlan}
          resourcePlanningState={resourcePlanningState}
          editingItemId={editingItemId}
          editData={editData}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onEditDataChange={updateEditData}
          editLoading={editLoading}
        />
      </div>

      <div className="w-80 flex-shrink-0">
        <div className="sticky top-4">
          <ResourcePlanningForm
            preselectedProfileId={preselectedProfileId}
            editingItem={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </div>

      <BulkResourcePlanningImport
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={handleBulkImportSuccess}
      />
    </div>
  );
};
