
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';
import { ResourcePlanningSearchControls } from './ResourcePlanningSearchControls';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { UnplannedResourcesTab } from './UnplannedResourcesTab';
import { PlannedResourcesTab } from './PlannedResourcesTab';
import { ResourceAssignmentForm } from './ResourceAssignmentForm';
import { useResourceAssignmentForm } from './hooks/useResourceAssignmentForm';
import { usePlannedResources } from '@/hooks/use-planned-resources';

export const ResourcePlanningTable: React.FC = () => {
  const {
    // Only get the filter states and handlers from the main hook
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    showUnplanned,
    setShowUnplanned,
    clearFilters,
  } = useResourcePlanning();

  // Get planned resources count for tab display
  const { data: plannedData } = useResourcePlanning();

  // Get unplanned resources count for tab display
  const { unplannedResources } = useUnplannedResources({
    searchQuery,
    selectedSbu,
    selectedManager,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [preselectedProfileId, setPreselectedProfileId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createResourcePlanning, updateResourcePlanning } = usePlannedResources();

  const formState = useResourceAssignmentForm({
    mode: editingItem ? 'edit' : 'create',
    preselectedProfileId,
    item: editingItem,
  });

  const handleCreatePlan = (profileId: string) => {
    console.log('Creating plan for profile:', profileId);
    setPreselectedProfileId(profileId);
    setEditingItem(null);
    setShowCreateForm(true);
  };

  const handleCreateNewAssignment = () => {
    setPreselectedProfileId(null);
    setEditingItem(null);
    setShowCreateForm(true);
  };

  const handleEditAssignment = (item: any) => {
    setEditingItem(item);
    setPreselectedProfileId(null);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.profileId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const resourcePlanningData = formState.getFormData();

    try {
      if (editingItem) {
        await new Promise<void>((resolve, reject) => {
          updateResourcePlanning(
            {
              id: editingItem.id,
              updates: resourcePlanningData,
            },
            {
              onSuccess: () => {
                formState.resetForm();
                setShowCreateForm(false);
                setEditingItem(null);
                setPreselectedProfileId(null);
                resolve();
              },
              onError: (error) => reject(error),
            }
          );
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          createResourcePlanning(resourcePlanningData, {
            onSuccess: () => {
              formState.resetForm();
              setShowCreateForm(false);
              setPreselectedProfileId(null);
              resolve();
            },
            onError: (error) => reject(error),
          });
        });
      }
    } catch (error) {
      console.error('Mutation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingItem(null);
    setPreselectedProfileId(null);
    formState.resetForm();
  };

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
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Resource Assignment' : 'Create Resource Assignment'}
            </h3>
            <ResourceAssignmentForm
              mode={editingItem ? 'edit' : 'create'}
              profileId={formState.profileId}
              setProfileId={formState.setProfileId}
              billTypeId={formState.billTypeId}
              setBillTypeId={formState.setBillTypeId}
              projectId={formState.projectId}
              setProjectId={formState.setProjectId}
              engagementPercentage={formState.engagementPercentage}
              setEngagementPercentage={formState.setEngagementPercentage}
              releaseDate={formState.releaseDate}
              setReleaseDate={formState.setReleaseDate}
              engagementStartDate={formState.engagementStartDate}
              setEngagementStartDate={formState.setEngagementStartDate}
              preselectedProfileId={preselectedProfileId}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </div>
        )}

        <Tabs value={showUnplanned ? "unplanned" : "planned"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="planned" 
              onClick={() => setShowUnplanned(false)}
            >
              Planned Resources ({plannedData.length})
            </TabsTrigger>
            <TabsTrigger 
              value="unplanned" 
              onClick={() => setShowUnplanned(true)}
            >
              Unplanned Resources ({unplannedResources.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planned" className="mt-4">
            <PlannedResourcesTab
              searchQuery={searchQuery}
              selectedSbu={selectedSbu}
              selectedManager={selectedManager}
              onCreateNewAssignment={handleCreateNewAssignment}
              onEditAssignment={handleEditAssignment}
            />
          </TabsContent>

          <TabsContent value="unplanned" className="mt-4">
            <UnplannedResourcesTab
              searchQuery={searchQuery}
              selectedSbu={selectedSbu}
              selectedManager={selectedManager}
              onCreatePlan={handleCreatePlan}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
