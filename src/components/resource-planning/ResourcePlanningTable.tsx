
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';
import { useWeeklyValidation } from '@/hooks/use-weekly-validation';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useInlineEdit } from './hooks/useInlineEdit';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { AdvancedResourceFilters } from './AdvancedResourceFilters';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { BulkResourcePlanningImport } from './BulkResourcePlanningImport';

export const ResourcePlanningTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSbu, setSelectedSbu] = React.useState<string | null>(null);
  const [selectedManager, setSelectedManager] = React.useState<string | null>(null);
  const [showUnplanned, setShowUnplanned] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('planned');
  const [showBulkImport, setShowBulkImport] = React.useState(false);

  const clearBasicFilters = () => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
  };

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

  // Get planned resources hook with advanced filters
  const plannedResources = usePlannedResources();
  
  // Create advanced filter props for other hooks
  const advancedFilterProps = {
    billTypeFilter: plannedResources.advancedFilters.billTypeFilter,
    projectSearch: plannedResources.advancedFilters.projectSearch,
    minEngagementPercentage: plannedResources.advancedFilters.minEngagementPercentage,
    maxEngagementPercentage: plannedResources.advancedFilters.maxEngagementPercentage,
    minBillingPercentage: plannedResources.advancedFilters.minBillingPercentage,
    maxBillingPercentage: plannedResources.advancedFilters.maxBillingPercentage,
    startDateFrom: plannedResources.advancedFilters.startDateFrom,
    startDateTo: plannedResources.advancedFilters.startDateTo,
    endDateFrom: plannedResources.advancedFilters.endDateFrom,
    endDateTo: plannedResources.advancedFilters.endDateTo,
  };

  // Initialize other hooks with filters
  const unplannedResources = useUnplannedResources({
    searchQuery,
    selectedSbu,
    selectedManager,
    ...advancedFilterProps,
  });
  
  const weeklyValidationData = useWeeklyValidation({
    searchQuery,
    selectedSbu,
    selectedManager,
    ...advancedFilterProps,
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

  const handleInlineEdit = (item: any) => {
    startEdit(item);
  };

  const handleBulkImportSuccess = () => {
    plannedResources.setSearchQuery('');
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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSbu={selectedSbu}
          setSelectedSbu={setSelectedSbu}
          selectedManager={selectedManager}
          setSelectedManager={setSelectedManager}
          clearFilters={clearBasicFilters}
        >
          <AdvancedResourceFilters
            filters={plannedResources.advancedFilters}
            onFiltersChange={plannedResources.setAdvancedFilters}
            onClearFilters={clearAdvancedFilters}
          />
        </ResourcePlanningFilters>

        <ResourcePlanningTabs
          showUnplanned={showUnplanned}
          setShowUnplanned={setShowUnplanned}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
