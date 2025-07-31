
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { ResourcePlanningTabs } from './ResourcePlanningTabs';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useCentralizedResourcePlanning } from '@/hooks/use-centralized-resource-planning';
import { useResourcePlanningEdit } from './hooks/useResourcePlanningEdit';

export const ResourcePlanningTable: React.FC = () => {
  const {
    preselectedProfileId,
    editingItem,
    handleCreatePlan,
    handleCreateNewAssignment,
    handleEditAssignment,
    handleFormSuccess,
    handleFormCancel,
  } = useResourcePlanningState();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Use centralized resource planning hook
  const centralizedState = useCentralizedResourcePlanning();

  // Inline editing hook
  const editingState = useResourcePlanningEdit();

  const handleToggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Don't show advanced filters for unplanned tab since they don't support advanced filtering
  const shouldShowAdvancedFilters = centralizedState.activeTab !== 'unplanned';

  return (
    <div className="space-y-6">
      {/* Resource Planning Form */}
      {(preselectedProfileId || editingItem) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Resource Planning' : 'Create Resource Planning'}
            </CardTitle>
            <CardDescription>
              {editingItem 
                ? 'Update the resource planning assignment'
                : 'Assign a resource to a project'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourcePlanningForm
              key={editingItem?.id || preselectedProfileId}
              preselectedProfileId={preselectedProfileId}
              editingItem={editingItem}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Resource Planning Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resource Planning</CardTitle>
            <CardDescription>
              Manage resource assignments, track project allocations, and plan resource utilization
            </CardDescription>
          </div>
          <Button onClick={handleCreateNewAssignment}>
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Filters */}
          <ResourcePlanningFilters
            searchQuery={centralizedState.searchQuery}
            setSearchQuery={centralizedState.setSearchQuery}
            selectedSbu={centralizedState.selectedSbu}
            setSelectedSbu={centralizedState.setSelectedSbu}
            selectedManager={centralizedState.selectedManager}
            setSelectedManager={centralizedState.setSelectedManager}
            clearFilters={centralizedState.clearBasicFilters}
            showAdvancedFilters={shouldShowAdvancedFilters && showAdvancedFilters}
            onToggleAdvancedFilters={shouldShowAdvancedFilters ? handleToggleAdvancedFilters : undefined}
            advancedFilters={centralizedState.advancedFilters}
            setAdvancedFilters={centralizedState.setAdvancedFilters}
            onClearAdvancedFilters={centralizedState.clearAdvancedFilters}
          />

          {/* Tabs with Data */}
          <ResourcePlanningTabs
            activeTab={centralizedState.activeTab}
            setActiveTab={centralizedState.setActiveTab}
            searchQuery={centralizedState.searchQuery}
            selectedSbu={centralizedState.selectedSbu}
            selectedManager={centralizedState.selectedManager}
            onCreateNewAssignment={handleCreateNewAssignment}
            onEditAssignment={handleEditAssignment}
            onCreatePlan={handleCreatePlan}
            resourcePlanningState={centralizedState}
            editingItemId={editingState.editingItemId}
            editData={editingState.editData}
            onStartEdit={editingState.handleStartEdit}
            onCancelEdit={editingState.handleCancelEdit}
            onSaveEdit={editingState.handleSaveEdit}
            onEditDataChange={editingState.handleEditDataChange}
            editLoading={editingState.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
