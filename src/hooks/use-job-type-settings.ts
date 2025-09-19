import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobTypeFormData {
  name: string;
  color_code?: string;
}

export interface JobTypeItem {
  id: string;
  name: string;
  color_code?: string;
  created_at: string;
}

export const useJobTypeSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchJobTypes = async () => {
    const { data, error } = await supabase
      .from('job_type')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as JobTypeItem[];
  };
  
  const { 
    data: items, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['job_types'],
    queryFn: fetchJobTypes,
  });
  
  const addJobTypeMutation = useMutation({
    mutationFn: async (newItemData: JobTypeFormData) => {
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.name.toLowerCase() === newItemData.name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${newItemData.name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from('job_type')
        .insert(newItemData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_types'] });
    },
  });
  
  const updateJobTypeMutation = useMutation({
    mutationFn: async ({ 
      id, 
      ...updateData
    }: { 
      id: string; 
    } & JobTypeFormData) => {
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.id !== id && item.name.toLowerCase() === updateData.name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${updateData.name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from('job_type')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_types'] });
    },
  });
  
  const deleteJobTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('job_type')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_types'] });
    },
  });
  
  const bulkImportMutation = useMutation({
    mutationFn: async (jobTypes: JobTypeFormData[]) => {
      const { data, error } = await supabase
        .from('job_type')
        .insert(jobTypes)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_types'] });
    },
  });
  
  const addItem = (value: JobTypeFormData) => {
    if (!value.name.trim()) return;
    
    addJobTypeMutation.mutate(value, {
      onSuccess: () => {
        toast({
          title: "Job type added",
          description: `"${value.name}" has been added.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to add job type: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const updateItem = (id: string, data: JobTypeFormData) => {
    if (!data.name.trim()) return;
    
    updateJobTypeMutation.mutate({ id, ...data }, {
      onSuccess: () => {
        toast({
          title: "Job type updated",
          description: `Job type has been updated.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update job type: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const removeItem = (id: string, name: string) => {
    deleteJobTypeMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Job type removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove job type: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  const bulkImport = (jobTypes: JobTypeFormData[]) => {
    bulkImportMutation.mutate(jobTypes, {
      onSuccess: (data) => {
        toast({
          title: "Bulk import successful",
          description: `${data?.length || 0} job types have been imported.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Bulk import failed",
          description: `Failed to import job types: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    isAddingItem: addJobTypeMutation.isPending,
    isUpdatingItem: updateJobTypeMutation.isPending,
    isRemovingItem: deleteJobTypeMutation.isPending,
    isBulkImporting: bulkImportMutation.isPending
  };
};