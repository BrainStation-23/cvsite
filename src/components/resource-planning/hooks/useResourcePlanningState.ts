
import { useState } from 'react';

interface ResourcePlanningItem {
  id: string;
  profile_id: string;
  [key: string]: any;
}

export function useResourcePlanningState() {
  const [preselectedProfileId, setPreselectedProfileId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ResourcePlanningItem | null>(null);

  const handleCreatePlan = (profileId: string) => {
    console.log('Creating plan for profile:', profileId);
    setPreselectedProfileId(profileId);
    setEditingItem(null);
  };

  const handleCreateNewAssignment = () => {
    console.log('Creating new assignment');
    setPreselectedProfileId(null);
    setEditingItem(null);
  };

  const handleEditAssignment = (item: ResourcePlanningItem) => {
    console.log('Editing assignment:', item);
    setEditingItem(item);
    setPreselectedProfileId(null);
  };

  const handleFormSuccess = () => {
    console.log('Form submitted successfully');
    setPreselectedProfileId(null);
    setEditingItem(null);
  };

  const handleFormCancel = () => {
    console.log('Form cancelled');
    setPreselectedProfileId(null);
    setEditingItem(null);
  };

  return {
    preselectedProfileId,
    editingItem,
    handleCreatePlan,
    handleCreateNewAssignment,
    handleEditAssignment,
    handleFormSuccess,
    handleFormCancel,
  };
}
