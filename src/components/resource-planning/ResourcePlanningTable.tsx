
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';
import { ResourcePlanningSearchControls } from './ResourcePlanningSearchControls';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';

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
    data: plannedData,
  } = useResourcePlanning();

  const { unplannedResources } = useUnplannedResources({
    searchQuery,
    selectedSbu,
    selectedManager,
  });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Planning</CardTitle>
        
        <div className="space-y-4">
          <ResourcePlanningFilters
            selectedSbu={selectedSbu}
            onSbuChange={setSelectedSbu}
            selectedManager={selectedManager}
            onManagerChange={setSelectedManager}
            showUnplanned={showUnplanned}
            onShowUnplannedChange={setShowUnplanned}
            onClearFilters={clearFilters}
            />
          
          <ResourcePlanningSearchControls 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {showCreateForm && (
          <ResourcePlanningForm
            preselectedProfileId={preselectedProfileId}
            editingItem={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        <ResourcePlanningTabs
          showUnplanned={showUnplanned}
          setShowUnplanned={setShowUnplanned}
          plannedCount={plannedData.length}
          unplannedCount={unplannedResources.length}
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          onCreateNewAssignment={handleCreateNewAssignment}
          onEditAssignment={handleEditAssignment}
          onCreatePlan={handleCreatePlan}
        />
      </CardContent>
    </Card>
  );
};
