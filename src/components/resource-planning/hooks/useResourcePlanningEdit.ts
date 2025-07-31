
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useResourcePlanningEdit() {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('resource_planning')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-planning-data'] });
      setEditingItemId(null);
      setEditData(null);
      toast({
        title: 'Success',
        description: 'Resource planning updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to update resource planning.',
        variant: 'destructive',
      });
    },
  });

  const handleStartEdit = (item: any) => {
    setEditingItemId(item.id);
    setEditData({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditData(null);
  };

  const handleSaveEdit = () => {
    if (editingItemId && editData) {
      editMutation.mutate({ id: editingItemId, data: editData });
    }
  };

  const handleEditDataChange = (newData: any) => {
    setEditData({ ...editData, ...newData });
  };

  return {
    editingItemId,
    editData,
    isLoading: editMutation.isPending,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleEditDataChange,
  };
}
