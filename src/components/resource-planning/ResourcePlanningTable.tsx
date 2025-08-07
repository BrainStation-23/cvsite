
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { usePlannedResourcesTab } from '@/hooks/use-planned-resources-tab';
import { useWeeklyValidationTab } from '@/hooks/use-weekly-validation-tab';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useInlineEdit } from './hooks/useInlineEdit';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { AdvancedResourceFilters } from './AdvancedResourceFilters';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { BulkResourcePlanningImport } from './BulkResourcePlanningImport';

export const ResourcePlanningTable: React.FC = () => {
  const [showBulkImport, setShowBulkImport] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('planned');

  // Use separate hooks for each tab
  const plannedResourcesState = usePlannedResourcesTab();
  const weeklyValidationState = useWeeklyValidationTab();

  // Resource planning form state
  const {
    preselectedProfileId,
    editingItem,
    handleCreatePlan,
    handleCreateNewAssignment,
    handleEditAssignment,
    handleFormSuccess,
    handleFormCancel,
  } = useResourcePlanningState();

  // Inline edit functionality
  const {
    editingItemId,
    editData,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditData,
    isLoading: editLoading,
  } = useInlineEdit();

  // Get the current state based on active tab
  const currentState = activeTab === 'planned' ? plannedResourcesState : weeklyValidationState;

  const handleBulkImportSuccess = () => {
    plannedResourcesState.refetch();
    weeklyValidationState.refetch();
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
          searchQuery={currentState.searchQuery}
          setSearchQuery={currentState.setSearchQuery}
          selectedSbu={currentState.selectedSbu}
          setSelectedSbu={currentState.setSelectedSbu}
          selectedManager={currentState.selectedManager}
          setSelectedManager={currentState.setSelectedManager}
          clearFilters={currentState.clearBasicFilters}
          activeTab={activeTab}
        >
          <AdvancedResourceFilters
            filters={currentState.advancedFilters}
            onFiltersChange={currentState.setAdvancedFilters}
            onClearFilters={currentState.clearAdvancedFilters}
          />
        </ResourcePlanningFilters>

        <ResourcePlanningTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={currentState.searchQuery}
          selectedSbu={currentState.selectedSbu}
          selectedManager={currentState.selectedManager}
          onCreateNewAssignment={handleCreateNewAssignment}
          onEditAssignment={startEdit}
          onCreatePlan={handleCreatePlan}
          plannedResourcesState={plannedResourcesState}
          weeklyValidationState={weeklyValidationState}
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
