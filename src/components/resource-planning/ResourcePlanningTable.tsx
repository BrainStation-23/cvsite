
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';
import { useWeeklyValidation } from '@/hooks/use-weekly-validation';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useInlineEdit } from './hooks/useInlineEdit';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { BulkResourcePlanningImport } from './BulkResourcePlanningImport';

export const ResourcePlanningTable: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('planned');
  const [showBulkImport, setShowBulkImport] = React.useState(false);

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

  // Get planned resources hook with filters
  const plannedResources = usePlannedResources();
  
  // Initialize other hooks with filters
  const unplannedResources = useUnplannedResources({
    searchQuery: '',
    selectedSbu: null,
    selectedManager: null,
    ...plannedResources.advancedFilters,
  });
  
  const weeklyValidationData = useWeeklyValidation({
    searchQuery: '',
    selectedSbu: null,
    selectedManager: null,
    ...plannedResources.advancedFilters,
  });

  const handleInlineEdit = (item: any) => {
    startEdit(item);
  };

  const handleBulkImportSuccess = () => {
    plannedResources.setCurrentPage(1);
    unplannedResources.refetch();
    weeklyValidationData.refetch();
  };

  const clearAdvancedFilters = () => {
    plannedResources.setAdvancedFilters({
      billTypeFilter: null,
      projectSearch: '',
      minEngagementPercentage: null,
      maxEngagementPercentage: null,
      minBillingPercentage: null,
      maxBillingPercentage: null,
      startDateFrom: '',
      startDateTo: '',
      endDateFrom: '',
      endDateTo: '',
    });
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
          searchQuery=""
          setSearchQuery={() => {}}
          selectedSbu={null}
          setSelectedSbu={() => {}}
          selectedManager={null}
          setSelectedManager={() => {}}
          clearFilters={() => {}}
          advancedFilters={plannedResources.advancedFilters}
          onAdvancedFiltersChange={plannedResources.setAdvancedFilters}
          onClearAdvancedFilters={clearAdvancedFilters}
        />

        <ResourcePlanningTabs
          showUnplanned={false}
          setShowUnplanned={() => {}}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery=""
          selectedSbu={null}
          selectedManager={null}
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
