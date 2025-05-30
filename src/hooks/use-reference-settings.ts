
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReferenceItem {
  id: string;
  name: string;
  email: string;
  designation: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export interface ReferenceFormData {
  name: string;
  email: string;
  designation: string;
  company: string;
}

export const useReferenceSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchReferences = async () => {
    const { data, error } = await supabase
      .from('references')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as ReferenceItem[];
  };
  
  const { 
    data: items, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['references'],
    queryFn: fetchReferences,
  });
  
  const addReferenceMutation = useMutation({
    mutationFn: async (formData: ReferenceFormData) => {
      const { data, error } = await supabase
        .from('references')
        .insert(formData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
      queryClient.invalidateQueries({ queryKey: ['reference-search'] });
    },
  });
  
  const updateReferenceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReferenceFormData> }) => {
      const { data: result, error } = await supabase
        .from('references')
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
      queryClient.invalidateQueries({ queryKey: ['reference-search'] });
    },
  });
  
  const deleteReferenceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('references')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
      queryClient.invalidateQueries({ queryKey: ['reference-search'] });
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (references: ReferenceFormData[]) => {
      const { data, error } = await supabase
        .from('references')
        .insert(references)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
      queryClient.invalidateQueries({ queryKey: ['reference-search'] });
    },
  });
  
  const addItem = (formData: ReferenceFormData) => {
    addReferenceMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Reference added",
          description: `"${formData.name}" has been added.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to add reference: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const updateItem = (id: string, data: Partial<ReferenceFormData>) => {
    updateReferenceMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast({
          title: "Reference updated",
          description: "Reference has been updated successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update reference: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const removeItem = (id: string, name: string) => {
    deleteReferenceMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Reference removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove reference: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  const bulkImport = (references: ReferenceFormData[]) => {
    bulkCreateMutation.mutate(references, {
      onSuccess: () => {
        toast({
          title: "Import successful",
          description: `${references.length} references have been imported.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Import failed",
          description: `Failed to import references: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    isAddingItem: addReferenceMutation.isPending,
    isUpdatingItem: updateReferenceMutation.isPending,
    isRemovingItem: deleteReferenceMutation.isPending,
    isBulkImporting: bulkCreateMutation.isPending
  };
};
