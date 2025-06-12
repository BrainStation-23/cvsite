
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HrContactItem {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface HrContactFormData {
  name: string;
  email: string;
}

export const useHrContactSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchHrContacts = async () => {
    const { data, error } = await supabase
      .from('hr_contacts')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as HrContactItem[];
  };
  
  const { 
    data: items, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['hr_contacts'],
    queryFn: fetchHrContacts,
  });
  
  const addHrContactMutation = useMutation({
    mutationFn: async (formData: HrContactFormData) => {
      const { data, error } = await supabase
        .from('hr_contacts')
        .insert(formData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr_contacts'] });
    },
  });
  
  const updateHrContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HrContactFormData> }) => {
      const { data: result, error } = await supabase
        .from('hr_contacts')
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr_contacts'] });
    },
  });
  
  const deleteHrContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('hr_contacts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr_contacts'] });
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (hrContacts: HrContactFormData[]) => {
      const { data, error } = await supabase
        .from('hr_contacts')
        .insert(hrContacts)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr_contacts'] });
    },
  });
  
  const addItem = (formData: HrContactFormData) => {
    addHrContactMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "HR Contact added",
          description: `"${formData.name}" has been added.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to add HR Contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const updateItem = (id: string, data: Partial<HrContactFormData>) => {
    updateHrContactMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast({
          title: "HR Contact updated",
          description: "HR Contact has been updated successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update HR Contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const removeItem = (id: string, name: string) => {
    deleteHrContactMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "HR Contact removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove HR Contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  const bulkImport = (hrContacts: HrContactFormData[]) => {
    bulkCreateMutation.mutate(hrContacts, {
      onSuccess: () => {
        toast({
          title: "Import successful",
          description: `${hrContacts.length} HR Contacts have been imported.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Import failed",
          description: `Failed to import HR Contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    isAddingItem: addHrContactMutation.isPending,
    isUpdatingItem: updateHrContactMutation.isPending,
    isRemovingItem: deleteHrContactMutation.isPending,
    isBulkImporting: bulkCreateMutation.isPending
  };
};
