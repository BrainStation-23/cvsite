
import { useState } from 'react';

export const useResourcePlanningState = () => {
  const [preselectedProfileId, setPreselectedProfileId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleCreatePlan = (profileId: string) => {
    setPreselectedProfileId(profileId);
    setEditingItem(null);
  };

  const handleCreateNewAssignment = () => {
    setPreselectedProfileId(null);
    setEditingItem(null);
  };

  const handleEditAssignment = (item: any) => {
    setEditingItem(item);
    setPreselectedProfileId(null);
  };

  const handleFormSuccess = () => {
    setEditingItem(null);
    setPreselectedProfileId(null);
  };

  const handleFormCancel = () => {
    setEditingItem(null);
    setPreselectedProfileId(null);
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
};
