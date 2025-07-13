import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlannedResourcesTab } from './PlannedResourcesTab';
import { UnplannedResourcesTab } from './UnplannedResourcesTab';

interface ResourcePlanningTabsProps {
  showUnplanned: boolean;
  setShowUnplanned: (show: boolean) => void;
  plannedCount: number;
  unplannedCount: number;
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  onCreateNewAssignment: () => void;
  onEditAssignment: (item: any) => void;
  onCreatePlan: (profileId: string) => void;
}

export const ResourcePlanningTabs: React.FC<ResourcePlanningTabsProps> = ({
  showUnplanned,
  setShowUnplanned,
  plannedCount,
  unplannedCount,
  searchQuery,
  selectedSbu,
  selectedManager,
  onCreateNewAssignment,
  onEditAssignment,
  onCreatePlan,
}) => {
  return (
    <Tabs value={showUnplanned ? "unplanned" : "planned"} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger 
          value="planned" 
          onClick={() => setShowUnplanned(false)}
        >
          Planned Resources ({plannedCount})
        </TabsTrigger>
        <TabsTrigger 
          value="unplanned" 
          onClick={() => setShowUnplanned(true)}
        >
          Unplanned Resources ({unplannedCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="planned" className="mt-4">
        <PlannedResourcesTab
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          onCreateNewAssignment={onCreateNewAssignment}
          onEditAssignment={onEditAssignment}
        />
      </TabsContent>

      <TabsContent value="unplanned" className="mt-4">
        <UnplannedResourcesTab
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          onCreatePlan={onCreatePlan}
        />
      </TabsContent>
    </Tabs>
  );
};