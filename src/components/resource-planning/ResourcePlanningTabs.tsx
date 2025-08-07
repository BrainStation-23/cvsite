
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlannedResourcesTab } from './PlannedResourcesTab';
import { UnplannedResourcesTab } from './UnplannedResourcesTab';
import { WeeklyValidationTab } from './WeeklyValidationTab';

interface ResourcePlanningTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  onCreateNewAssignment: () => void;
  onEditAssignment: (item: any) => void;
  onCreatePlan: (profileId: string) => void;
  // Separate state objects for each tab
  plannedResourcesState: any;
  weeklyValidationState: any;
  // Inline edit props
  editingItemId: string | null;
  editData: any;
  onStartEdit: (item: any) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditDataChange: (data: any) => void;
  editLoading: boolean;
}

export const ResourcePlanningTabs: React.FC<ResourcePlanningTabsProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  selectedSbu,
  selectedManager,
  onCreateNewAssignment,
  onEditAssignment,
  onCreatePlan,
  plannedResourcesState,
  weeklyValidationState,
  editingItemId,
  editData,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDataChange,
  editLoading,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="planned">
          Planned Resources
        </TabsTrigger>
        <TabsTrigger value="unplanned">
          Unplanned Resources
        </TabsTrigger>
        <TabsTrigger value="weekly-validation">
          Weekly Validation
        </TabsTrigger>
      </TabsList>

      <TabsContent value="planned" className="mt-4">
        <PlannedResourcesTab
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          onCreateNewAssignment={onCreateNewAssignment}
          onEditAssignment={onEditAssignment}
          resourcePlanningState={plannedResourcesState}
          editingItemId={editingItemId}
          editData={editData}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          onEditDataChange={onEditDataChange}
          editLoading={editLoading}
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

      <TabsContent value="weekly-validation" className="mt-4">
        <WeeklyValidationTab
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          resourcePlanningState={weeklyValidationState}
          editingItemId={editingItemId}
          editData={editData}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          onEditDataChange={onEditDataChange}
          editLoading={editLoading}
        />
      </TabsContent>
    </Tabs>
  );
};
