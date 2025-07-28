import { useState } from 'react';

export const useResourcePlanningState = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [preselectedProfileId, setPreselectedProfileId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleCreatePlan = (profileId: string) => {
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

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingItem(null);
    setPreselectedProfileId(null);
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setEditingItem(null);
    setPreselectedProfileId(null);
  };

  return {
    showCreateForm,
    preselectedProfileId,
    editingItem,
    handleCreatePlan,
    handleCreateNewAssignment,
    handleEditAssignment,
    handleFormSuccess,
    handleFormCancel,
  };
};