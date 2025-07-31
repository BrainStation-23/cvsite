
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useInlineEdit } from './hooks/useInlineEdit';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { AdvancedResourceFilters } from './AdvancedResourceFilters';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { BulkResourcePlanningImport } from './BulkResourcePlanningImport';

export const ResourcePlanningTable: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('planned');
  const [showBulkImport, setShowBulkImport] = React.useState(false);

  const {
    // Filter states
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    showUnplanned,
    setShowUnplanned,
    advancedFilters,
    setAdvancedFilters,
    clearFilters,
    clearAdvancedFilters,
    // Data
    plannedResources,
    unplannedResources,
    weeklyValidationData,
  } = useResourcePlanning();

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
  } = useInlineEdit();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowUnplanned(value === "unplanned");
  };

  const handleInlineEdit = (item: any) => {
    startEdit(item);
  };

  const handleBulkImportSuccess = () => {
    setSearchQuery('');
    // Trigger refetch by clearing and resetting search
    setSearchQuery('');
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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSbu={selectedSbu}
          setSelectedSbu={setSelectedSbu}
          selectedManager={selectedManager}
          setSelectedManager={setSelectedManager}
          clearFilters={clearFilters}
        >
          <AdvancedResourceFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            onClearFilters={clearAdvancedFilters}
          />
        </ResourcePlanningFilters>

        <ResourcePlanningTabs
          showUnplanned={showUnplanned}
          setShowUnplanned={setShowUnplanned}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          onCreateNewAssignment={handleCreateNewAssignment}
          onEditAssignment={handleInlineEdit}
          onCreatePlan={handleCreatePlan}
          plannedResources={plannedResources}
          unplannedResources={unplannedResources}
          weeklyValidationData={weeklyValidationData}
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
