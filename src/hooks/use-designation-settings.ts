
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DesignationItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useDesignationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchDesignations = async () => {
    const { data, error } = await supabase
      .from('designations')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as DesignationItem[];
  };
  
  const { 
    data: designations, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['designations'],
    queryFn: fetchDesignations,
  });
  
  const addDesignationMutation = useMutation({
    mutationFn: async (name: string) => {
      const existingDesignations = designations || [];
      const designationExists = existingDesignations.some(designation => 
        designation.name.toLowerCase() === name.toLowerCase()
      );
      
      if (designationExists) {
        throw new Error(`"${name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from('designations')
        .insert({ name })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['designation-search'] });
    },
  });
  
  const updateDesignationMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('designations')
        .update({ name })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['designation-search'] });
    },
  });
  
  const deleteDesignationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('designations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['designation-search'] });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (designationsData: Array<{ name: string }>) => {
      const { data, error } = await supabase
        .from('designations')
        .insert(designationsData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['designation-search'] });
    },
  });
  
  const addDesignation = (name: string) => {
    if (!name.trim()) return;
    
    addDesignationMutation.mutate(name.trim(), {
      onSuccess: () => {
        toast({
          title: "Designation added",
          description: `"${name}" has been added.`,
        });
      },
      onError: (error) => {
        if (error instanceof Error && error.message.includes("already exists")) {
          toast({
            title: "Designation already exists",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to add designation: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
    });
  };

  const updateDesignation = (id: string, name: string) => {
    updateDesignationMutation.mutate({ id, name }, {
      onSuccess: () => {
        toast({
          title: "Designation updated",
          description: `Designation has been updated to "${name}".`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update designation: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const deleteDesignation = (id: string, name: string) => {
    deleteDesignationMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Designation deleted",
          description: `"${name}" has been deleted.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to delete designation: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  const bulkImportDesignations = (designationsData: Array<{ name: string }>) => {
    bulkImportMutation.mutate(designationsData, {
      onSuccess: (data) => {
        toast({
          title: "Import successful",
          description: `${data?.length || 0} designations have been imported.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Import failed",
          description: `Failed to import designations: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  return {
    designations,
    isLoading,
    error,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    bulkImportDesignations,
    isAddingDesignation: addDesignationMutation.isPending,
    isUpdatingDesignation: updateDesignationMutation.isPending,
    isDeletingDesignation: deleteDesignationMutation.isPending,
    isBulkImporting: bulkImportMutation.isPending
  };
};
