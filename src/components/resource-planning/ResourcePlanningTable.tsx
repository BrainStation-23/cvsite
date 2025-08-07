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
import { useResourcePlanningOperations } from '../../hooks/use-resource-planning-operations';
import { useToast } from '../../hooks/use-toast';

export const ResourcePlanningTable: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('planned');

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

  // CRUD operations
  const { updateResourcePlanning, deleteResourcePlanning } = useResourcePlanningOperations();

  // Inline editing states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleStartEdit = (item: any) => {
    setEditingItemId(item.id);
    setEditData({
      engagement_percentage: item.engagement_percentage,
      billing_percentage: item.billing_percentage,
      engagement_start_date: item.engagement_start_date?.split('T')[0] || '',
      release_date: item.release_date?.split('T')[0] || '',
      engagement_complete: item.engagement_complete,
    });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditData({});
  };

  const handleSaveEdit = async () => {
    if (!editingItemId) return;

    setEditLoading(true);
    try {
      await updateResourcePlanning({
        id: editingItemId,
        updates: editData,
      });
      
      setEditingItemId(null);
      setEditData({});
      
      toast({
        title: 'Success',
        description: 'Resource assignment updated successfully.',
      });
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update resource assignment.',
        variant: 'destructive',
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditDataChange = (data: any) => {
    setEditData(prev => ({ ...prev, ...data }));
  };

  const handleEditAssignment = (item: any) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleCreateNewAssignment = () => {
    // This functionality would be handled by a parent component or routing
    console.log('Create new assignment clicked');
  };

  const handleCreatePlan = (profileId: string) => {
    console.log('Create plan for profile:', profileId);
    // This would typically open a dialog or form to create a new resource plan
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Resource Planning Table */}
        <div className="lg:col-span-2 space-y-4">
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
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onEditDataChange={handleEditDataChange}
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
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onEditDataChange={handleEditDataChange}
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

        {/* Right side - Create Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create Resource Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateResourcePlanningForm onSuccess={() => {
                // Only refresh the active tab's data
                if (activeTab === 'planned') {
                  plannedResourcesState.refetch();
                } else if (activeTab === 'validation') {
                  weeklyValidationState.refetch();
                }
              }} />
            </CardContent>
          </Card>
        </div>
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
