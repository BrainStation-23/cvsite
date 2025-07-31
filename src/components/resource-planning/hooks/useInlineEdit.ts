
import { useState, useCallback } from 'react';

interface EditData {
  profileId: string;
  billTypeId: string | null;
  projectId: string | null;
  engagementPercentage: number;
  billingPercentage: number;
  releaseDate: string;
  engagementStartDate: string;
}

export const useInlineEdit = () => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);

  const startEdit = useCallback((item: any) => {
    console.log('Starting edit for item:', item.id);
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
  }, []);

  const cancelEdit = useCallback(() => {
    console.log('Canceling edit');
    setEditingItemId(null);
    setEditData(null);
  }, []);

  const updateEditData = useCallback((newData: Partial<EditData>) => {
    setEditData(prev => prev ? { ...prev, ...newData } : null);
  }, []);

  return {
    editingItemId,
    editData,
    startEdit,
    cancelEdit,
    updateEditData,
    // Remove the saveEdit function - it will be handled by the parent component
  };
};
