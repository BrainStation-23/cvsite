
import { useState } from 'react';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { useToast } from '@/hooks/use-toast';

interface EditFormData {
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
  const [editData, setEditData] = useState<EditFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { updateResourcePlanning } = usePlannedResources();
  const { toast } = useToast();

  const startEdit = (item: any) => {
    console.log('Starting edit for item:', item);
    setEditingItemId(item.id);
    setEditData({
      profileId: item.profile_id,
      billTypeId: item.bill_type_id,
      projectId: item.project_id,
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

  const updateEditData = (updates: Partial<EditFormData>) => {
    if (editData) {
      setEditData({ ...editData, ...updates });
    }
  };

  const saveEdit = async () => {
    if (!editingItemId || !editData) return;

    setIsLoading(true);
    try {
      await new Promise<void>((resolve, reject) => {
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
              toast({
                title: 'Success',
                description: 'Resource assignment updated successfully',
              });
              setEditingItemId(null);
              setEditData(null);
              resolve();
            },
            onError: (error) => {
              toast({
                title: 'Error',
                description: 'Failed to update resource assignment',
                variant: 'destructive',
              });
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error('Error updating resource:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    editingItemId,
    editData,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditData,
    isLoading,
  };
};
