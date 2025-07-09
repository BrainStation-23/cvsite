
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';
import { ResourceAssignmentDialog } from './ResourceAssignmentDialog';
import { ResourcePlanningSearchControls } from './ResourcePlanningSearchControls';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { UnplannedResourcesTab } from './UnplannedResourcesTab';
import { PlannedResourcesTab } from './PlannedResourcesTab';

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

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [preselectedProfileId, setPreselectedProfileId] = useState<string | null>(null);

  const handleCreatePlan = (profileId: string) => {
    setPreselectedProfileId(profileId);
    setCreateDialogOpen(true);
  };

  const handleCreateNewAssignment = () => {
    setPreselectedProfileId(null);
    setCreateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setPreselectedProfileId(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resource Planning</CardTitle>
          <ResourceAssignmentDialog 
            mode="create" 
            open={createDialogOpen}
            onOpenChange={handleDialogClose}
            preselectedProfileId={preselectedProfileId}
          />
        </div>
        
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
