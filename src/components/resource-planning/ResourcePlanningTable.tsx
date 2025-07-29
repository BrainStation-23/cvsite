
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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSbu, setSelectedSbu] = React.useState<string | null>(null);
  const [selectedManager, setSelectedManager] = React.useState<string | null>(null);
  const [showUnplanned, setShowUnplanned] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('planned');
  const [showBulkImport, setShowBulkImport] = React.useState(false);

  const clearFilters = () => {
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

  // Centralized data fetching with current filters
  const plannedResources = usePlannedResources();
  const unplannedResources = useUnplannedResources({
    searchQuery,
    selectedSbu,
    selectedManager,
  });
  const weeklyValidationData = useWeeklyValidation({
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

  const handleBulkImportSuccess = () => {
    // Refresh all data after successful import
    plannedResources.setSearchQuery(''); // This will trigger a refetch
    unplannedResources.refetch();
    weeklyValidationData.refetch();
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main content area */}
      <div className="flex-1 space-y-4">
        {/* Header with Bulk Import Button */}
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
        />

        <ResourcePlanningTabs
          showUnplanned={showUnplanned}
          setShowUnplanned={setShowUnplanned}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          plannedCount={plannedResources.data?.length || 0}
          unplannedCount={unplannedResources.unplannedResources?.length || 0}
          weeklyValidationCount={weeklyValidationData.data?.length || 0}
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

      {/* Right sidebar for create assignment form */}
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

      {/* Bulk Import Dialog */}
      <BulkResourcePlanningImport
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={handleBulkImportSuccess}
      />
    </div>
  );
};
