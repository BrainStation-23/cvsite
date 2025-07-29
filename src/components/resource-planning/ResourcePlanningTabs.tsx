
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlannedResourcesTab } from './PlannedResourcesTab';
import { UnplannedResourcesTab } from './UnplannedResourcesTab';
import { WeeklyValidationTab } from './WeeklyValidationTab';

interface ResourcePlanningTabsProps {
  showUnplanned: boolean;
  setShowUnplanned: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  plannedCount: number;
  unplannedCount: number;
  weeklyValidationCount: number;
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  onCreateNewAssignment: () => void;
  onEditAssignment: (item: any) => void;
  onCreatePlan: (profileId: string) => void;
  // Centralized data props
  plannedResources: any;
  unplannedResources: any;
  weeklyValidationData: any;
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
  showUnplanned,
  setShowUnplanned,
  activeTab,
  setActiveTab,
  plannedCount,
  unplannedCount,
  weeklyValidationCount,
  searchQuery,
  selectedSbu,
  selectedManager,
  onCreateNewAssignment,
  onEditAssignment,
  onCreatePlan,
  plannedResources,
  unplannedResources,
  weeklyValidationData,
  editingItemId,
  editData,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDataChange,
  editLoading,
}) => {
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowUnplanned(value === "unplanned");
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="planned">
          Planned Resources ({plannedCount})
        </TabsTrigger>
        <TabsTrigger value="unplanned">
          Unplanned Resources ({unplannedCount})
        </TabsTrigger>
        <TabsTrigger value="weekly-validation">
          Weekly Validation ({weeklyValidationCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="planned" className="mt-4">
        <PlannedResourcesTab
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          onCreateNewAssignment={onCreateNewAssignment}
          onEditAssignment={onEditAssignment}
          plannedResources={plannedResources}
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
          unplannedResources={unplannedResources}
        />
      </TabsContent>

      <TabsContent value="weekly-validation" className="mt-4">
        <WeeklyValidationTab
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          weeklyValidationData={weeklyValidationData}
        />
      </TabsContent>
    </Tabs>
  );
};
