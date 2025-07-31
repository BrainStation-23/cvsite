
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { useResourceData } from './hooks/useResourceData';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useInlineEdit } from './hooks/useInlineEdit';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { AdvancedResourceFilters } from './AdvancedResourceFilters';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { BulkResourcePlanningImport } from './BulkResourcePlanningImport';

export const ResourcePlanningTable: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('planned');
  const [showBulkImport, setShowBulkImport] = React.useState(false);

  console.log('ResourcePlanningTable render');

  const {
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
    filterParams,
  } = useResourcePlanning();

  // Get centralized data
  const {
    plannedResources,
    unplannedResources,
    weeklyValidationData,
  } = useResourceData(filterParams);

  // Get mutation functions from planned resources hook
  const { updateResourcePlanning } = usePlannedResources(filterParams);

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
    updateEditData,
  } = useInlineEdit();

  // Handle save edit with the mutation function
  const handleSaveEdit = React.useCallback(() => {
    if (!editingItemId || !editData) return;

    console.log('Saving edit for item:', editingItemId);
    updateResourcePlanning(
      {
        id: editingItemId,
        updates: {
          bill_type_id: editData.billTypeId,
          project_id: editData.projectId,
          engagement_percentage: editData.engagementPercentage,
          billing_percentage: editData.billingPercentage,
          release_date: editData.releaseDate,
          engagement_start_date: editData.engagementStartDate,
        },
      },
      {
        onSuccess: () => {
          cancelEdit();
        },
      }
    );
  }, [editingItemId, editData, updateResourcePlanning, cancelEdit]);

  const handleTabChange = React.useCallback((value: string) => {
    console.log('Tab change to:', value);
    setActiveTab(value);
    setShowUnplanned(value === "unplanned");
  }, [setShowUnplanned]);

  const handleInlineEdit = React.useCallback((item: any) => {
    console.log('Inline edit for item:', item.id);
    startEdit(item);
  }, [startEdit]);

  const handleBulkImportSuccess = React.useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

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
          onSaveEdit={handleSaveEdit}
          onEditDataChange={updateEditData}
          editLoading={false}
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
