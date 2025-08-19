
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SbuItem {
  id: string;
  name: string;
  sbu_head_email: string;
  sbu_head_name: string;
  is_department: boolean;
  created_at: string;
  updated_at: string;
}

export interface SbuFormData {
  name: string;
  sbu_head_email: string;
  sbu_head_name: string;
  is_department: boolean;
}

export const useSbuSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchSbus = async () => {
    const { data, error } = await supabase
      .from('sbus')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as SbuItem[];
  };
  
  const { 
    data: items, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['sbus'],
    queryFn: fetchSbus,
  });
  
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['sbus'] });
    queryClient.invalidateQueries({ queryKey: ['sbu-search'] });
  };
  
  const addSbuMutation = useMutation({
    mutationFn: async (formData: SbuFormData) => {
      const { data, error } = await supabase
        .from('sbus')
        .insert(formData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateQueries();
    },
  });
  
  const updateSbuMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SbuFormData> }) => {
      const { data: result, error } = await supabase
        .from('sbus')
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      invalidateQueries();
    },
  });
  
  const deleteSbuMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('sbus')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateQueries();
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (sbus: SbuFormData[]) => {
      const { data, error } = await supabase
        .from('sbus')
        .insert(sbus)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateQueries();
    },
  });
  
  const addItem = (formData: SbuFormData) => {
    addSbuMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "SBU added",
          description: `"${formData.name}" has been added.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to add SBU: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const updateItem = (id: string, data: Partial<SbuFormData>) => {
    updateSbuMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast({
          title: "SBU updated",
          description: "SBU has been updated successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update SBU: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const removeItem = (id: string, name: string) => {
    deleteSbuMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "SBU removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove SBU: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  const bulkImport = (sbus: SbuFormData[]) => {
    bulkCreateMutation.mutate(sbus, {
      onSuccess: () => {
        toast({
          title: "Import successful",
          description: `${sbus.length} SBUs have been imported.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Import failed",
          description: `Failed to import SBUs: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    bulkImport,
    isAddingItem: addSbuMutation.isPending,
    isUpdatingItem: updateSbuMutation.isPending,
    isRemovingItem: deleteSbuMutation.isPending,
    isBulkImporting: bulkCreateMutation.isPending
  };
};
