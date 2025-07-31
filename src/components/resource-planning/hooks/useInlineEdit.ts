
import { useState, useCallback } from 'react';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { useToast } from '@/hooks/use-toast';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
  } | null;
}

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
  const { updateResourcePlanning, isUpdating } = usePlannedResources();
  const { toast } = useToast();

  const startEdit = useCallback((item: ResourcePlanningData) => {
    setEditingItemId(item.id);
    setEditData({
      profileId: item.profile_id,
      billTypeId: item.bill_type?.id || null,
      projectId: item.project?.id || null,
      engagementPercentage: item.engagement_percentage,
      billingPercentage: item.billing_percentage || 0,
      releaseDate: item.release_date || '',
      engagementStartDate: item.engagement_start_date || '',
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingItemId(null);
    setEditData(null);
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingItemId || !editData) return;

    const updateData = {
      bill_type_id: editData.billTypeId || undefined,
      project_id: editData.projectId || undefined,
      engagement_percentage: editData.engagementPercentage,
      billing_percentage: editData.billingPercentage,
      release_date: editData.releaseDate || undefined,
      engagement_start_date: editData.engagementStartDate || undefined,
    };

    updateResourcePlanning(
      { id: editingItemId, updates: updateData },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Resource assignment updated successfully",
          });
          setEditingItemId(null);
          setEditData(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update resource assignment",
            variant: "destructive",
          });
        },
      }
    );
  }, [editingItemId, editData, updateResourcePlanning, toast]);

  const updateEditData = useCallback((updates: Partial<EditFormData>) => {
    setEditData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

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
