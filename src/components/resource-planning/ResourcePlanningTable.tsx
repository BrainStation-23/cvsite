
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { AdvancedResourceFilters } from './AdvancedResourceFilters';
import { PlannedResourcesTab } from './PlannedResourcesTab';
import { WeeklyValidationTab } from './WeeklyValidationTab';
import { UnplannedResourcesTab } from './UnplannedResourcesTab';
import { CreateResourcePlanningForm } from './CreateResourcePlanningForm';
import { EditResourcePlanningDialog } from './EditResourcePlanningDialog';
import { usePlannedResourcesTab } from '../../hooks/use-planned-resources-tab';
import { useWeeklyValidationTab } from '../../hooks/use-weekly-validation-tab';
import { useInlineEdit } from './hooks/useInlineEdit';
import { useResourcePlanningPermissions } from '@/hooks/use-resource-permissions';

export const ResourcePlanningTable: React.FC = () => {
  const permissions = useResourcePlanningPermissions();
  const [activeTab, setActiveTab] = useState('planned');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [preselectedProfileId, setPreselectedProfileId] = useState<string | null>(null);

  // Basic filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  // Clear basic filters function
  const clearBasicFilters = () => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
  };

  // Hook instances with active tab optimization
  const plannedResourcesState = usePlannedResourcesTab(activeTab === 'planned');
  const weeklyValidationState = useWeeklyValidationTab(activeTab === 'validation');

  // Sync basic filters only with the active tab
  React.useEffect(() => {
    if (activeTab === 'planned') {
      plannedResourcesState.setSearchQuery(searchQuery);
      plannedResourcesState.setSelectedSbu(selectedSbu);
      plannedResourcesState.setSelectedManager(selectedManager);
    }
  }, [searchQuery, selectedSbu, selectedManager, activeTab]);

  React.useEffect(() => {
    if (activeTab === 'validation') {
      weeklyValidationState.setSearchQuery(searchQuery);
      weeklyValidationState.setSelectedSbu(selectedSbu);
      weeklyValidationState.setSelectedManager(selectedManager);
    }
  }, [searchQuery, selectedSbu, selectedManager, activeTab]);

  // Use the proper inline edit hook
  const {
    editingItemId,
    editData,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditData,
    isLoading: editLoading,
  } = useInlineEdit();

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleEditAssignment = (item: any) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleCreateNewAssignment = () => {
    setPreselectedProfileId(null);
    setShowCreateForm(true);
  };

  const handleCreatePlan = (profileId: string) => {
    if(!permissions.canCreate) {
      return;
    }
    console.log('Create plan for profile:', profileId);
    setPreselectedProfileId(profileId);
    setShowCreateForm(true);
  };

  const handleFormSuccess = () => {
    // Only refresh the active tab's data
    if (activeTab === 'planned') {
      plannedResourcesState.refetch();
    } else if (activeTab === 'validation') {
      weeklyValidationState.refetch();
    }
    // Reset form state
    setPreselectedProfileId(null);
    //hide form
    setShowCreateForm(false);
  };


  return (
    <div className="space-y-6">
      {/* Filters */}
      <ResourcePlanningFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSbu={selectedSbu}
        setSelectedSbu={setSelectedSbu}
        selectedManager={selectedManager}
        setSelectedManager={setSelectedManager}
        clearFilters={clearBasicFilters}
        showAdvancedFilters={true}
        activeTab={activeTab}
      >
        {/* Advanced Filters for Planned Resources Tab */}
        {activeTab === 'planned' && (
          <AdvancedResourceFilters
            filters={plannedResourcesState.advancedFilters}
            onFiltersChange={plannedResourcesState.setAdvancedFilters}
            onClearFilters={plannedResourcesState.clearAdvancedFilters}
          />
        )}

        {/* Advanced Filters for Weekly Validation Tab */}
        {activeTab === 'validation' && (
          <AdvancedResourceFilters
            filters={weeklyValidationState.advancedFilters}
            onFiltersChange={weeklyValidationState.setAdvancedFilters}
            onClearFilters={weeklyValidationState.clearAdvancedFilters}
          />
        )}
      </ResourcePlanningFilters>


      {/* Main Content */}
      <div className={`grid gap-6 ${showCreateForm ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Left side - Resource Planning Table */}
        <div className={`space-y-4 ${showCreateForm ? 'lg:col-span-2' : 'col-span-1'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="planned">Planned Resources</TabsTrigger>
              <TabsTrigger value="validation">Weekly Validation</TabsTrigger>
              <TabsTrigger value="unplanned">Unplanned Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="planned" className="mt-6">
              <PlannedResourcesTab
                searchQuery={searchQuery}
                selectedSbu={selectedSbu}
                selectedManager={selectedManager}
                onCreateNewAssignment={handleCreateNewAssignment}
                onEditAssignment={handleEditAssignment}
                resourcePlanningState={plannedResourcesState}
                editingItemId={editingItemId}
                editData={editData}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onEditDataChange={updateEditData}
                editLoading={editLoading}
              />
            </TabsContent>

            <TabsContent value="validation" className="mt-6">
              <WeeklyValidationTab
                searchQuery={searchQuery}
                selectedSbu={selectedSbu}
                selectedManager={selectedManager}
                resourcePlanningState={weeklyValidationState}
                editingItemId={editingItemId}
                editData={editData}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onEditDataChange={updateEditData}
                editLoading={editLoading}
              />
            </TabsContent>

            <TabsContent value="unplanned" className="mt-6">
              <UnplannedResourcesTab
                searchQuery={searchQuery}
                selectedSbu={selectedSbu}
                selectedManager={selectedManager}
                onCreatePlan={handleCreatePlan}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right side - Create Form (conditionally rendered) */}
        {showCreateForm && permissions.canCreate && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Create Resource Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateResourcePlanningForm 
                  preselectedProfileId={preselectedProfileId}
                  onSuccess={handleFormSuccess} 
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {selectedItem && (
        <EditResourcePlanningDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={selectedItem}
          onSuccess={() => {
            // Only refresh the active tab's data
            if (activeTab === 'planned') {
              plannedResourcesState.refetch();
            } else if (activeTab === 'validation') {
              weeklyValidationState.refetch();
            }
            setEditDialogOpen(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};
