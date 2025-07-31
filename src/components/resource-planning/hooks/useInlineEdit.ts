
import { useState } from 'react';
import { usePlannedResources } from '@/hooks/use-planned-resources';

export const useInlineEdit = () => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  // Create a dummy params object for the hook since we're not using the data here
  const { updateResourcePlanning, isUpdating } = usePlannedResources({
    searchQuery: '',
    selectedSbu: null,
    selectedManager: null
  });

  const startEdit = (item: any) => {
    setEditingItemId(item.id);
    setEditData({
      profileId: item.profile_id,
      billTypeId: item.bill_type?.id || null,
      projectId: item.project?.id || null,
      engagementPercentage: item.engagement_percentage,
      billingPercentage: item.billing_percentage,
      releaseDate: item.release_date || '',
      engagementStartDate: item.engagement_start_date || '',
    });
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditData(null);
  };

  const saveEdit = () => {
    if (!editingItemId || !editData) return;

    updateResourcePlanning(
      {
        id: editingItemId,
        updates: {
          bill_type_id: editData.billTypeId,
          project_id: editData.projectId,
          engagement_percentage: editData.engagementPercentage,
          billing_percentage: editData.billingPercentage,
          release_date: editData.releaseDate,
          engagement_start_date: editData.engagementStartDate,
        },
      },
      {
        onSuccess: () => {
          cancelEdit();
        },
      }
    );
  };

  const updateEditData = (newData: any) => {
    setEditData({ ...editData, ...newData });
  };

  return {
    editingItemId,
    editData,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditData,
    isLoading: isUpdating,
  };
};
