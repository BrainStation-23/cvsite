
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export const useInlineEditStable = () => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditFormData | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateResourcePlanningMutation = useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<{
        bill_type_id: string;
        project_id: string;
        engagement_percentage: number;
        billing_percentage: number;
        release_date: string;
        engagement_start_date: string;
        engagement_complete: boolean;
      }> 
    }) => {
      const { data, error } = await supabase
        .from('resource_planning')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all resource planning queries
      queryClient.invalidateQueries({ queryKey: ['centralized-resource-planning'] });
      queryClient.invalidateQueries({ queryKey: ['resource-planning-planned'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-validation'] });
      
      toast({
        title: "Success",
        description: "Resource assignment updated successfully",
      });
      setEditingItemId(null);
      setEditData(null);
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to update resource assignment",
        variant: "destructive",
      });
    },
  });

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

    updateResourcePlanningMutation.mutate({ id: editingItemId, updates: updateData });
  }, [editingItemId, editData, updateResourcePlanningMutation]);

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
    isLoading: updateResourcePlanningMutation.isPending,
  };
};
