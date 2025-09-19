import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobRoleFormData {
  name: string;
  purpose?: string;
  responsibilities?: string;
  color_code?: string;
}

export interface JobRoleItem {
  id: string;
  name: string;
  purpose?: string;
  responsibilities?: string;
  color_code?: string;
  created_at: string;
}

export const useJobRoleSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchJobRoles = async () => {
    const { data, error } = await supabase
      .from('job_role')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as JobRoleItem[];
  };
  
  const { 
    data: items, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['job_roles'],
    queryFn: fetchJobRoles,
  });
  
  const addJobRoleMutation = useMutation({
    mutationFn: async (newItemData: JobRoleFormData) => {
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.name.toLowerCase() === newItemData.name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${newItemData.name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from('job_role')
        .insert(newItemData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_roles'] });
    },
  });
  
  const updateJobRoleMutation = useMutation({
    mutationFn: async ({ 
      id, 
      ...updateData
    }: { 
      id: string; 
    } & JobRoleFormData) => {
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.id !== id && item.name.toLowerCase() === updateData.name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${updateData.name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from('job_role')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_roles'] });
    },
  });
  
  const deleteJobRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('job_role')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_roles'] });
    },
  });
  
  const bulkImportMutation = useMutation({
    mutationFn: async (jobRoles: JobRoleFormData[]) => {
      const { data, error } = await supabase
        .from('job_role')
        .insert(jobRoles)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_roles'] });
    },
  });
  
  const addItem = (value: JobRoleFormData) => {
    if (!value.name.trim()) return;
    
    addJobRoleMutation.mutate(value, {
      onSuccess: () => {
        toast({
          title: "Job role added",
          description: `"${value.name}" has been added.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to add job role: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const updateItem = (id: string, data: JobRoleFormData) => {
    if (!data.name.trim()) return;
    
    updateJobRoleMutation.mutate({ id, ...data }, {
      onSuccess: () => {
        toast({
          title: "Job role updated",
          description: `Job role has been updated.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update job role: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const removeItem = (id: string, name: string) => {
    deleteJobRoleMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Job role removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove job role: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  const bulkImport = (jobRoles: JobRoleFormData[]) => {
    bulkImportMutation.mutate(jobRoles, {
      onSuccess: (data) => {
        toast({
          title: "Bulk import successful",
          description: `${data?.length || 0} job roles have been imported.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Bulk import failed",
          description: `Failed to import job roles: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    isAddingItem: addJobRoleMutation.isPending,
    isUpdatingItem: updateJobRoleMutation.isPending,
    isRemovingItem: deleteJobRoleMutation.isPending,
    isBulkImporting: bulkImportMutation.isPending
  };
};