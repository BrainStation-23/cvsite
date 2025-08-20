
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the shape of a bill type item
export interface BillTypeItem {
  id: string;
  name: string;
  is_billable: boolean;
  is_support: boolean;
  non_billed: boolean;
  resource_type: string | null;
  resource_type_name?: string;
  created_at: string;
  updated_at: string;
}

export const useBillTypes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch bill types with resource type information
  const fetchBillTypes = async (): Promise<BillTypeItem[]> => {
    const { data, error } = await supabase
      .from('bill_types')
      .select(`
        *,
        resource_types!bill_types_resource_type_fkey (
          id,
          name
        )
      `)
      .order('name');
    
    if (error) throw error;
    
    // Transform the data to flatten the resource type information
    return data.map(item => ({
      ...item,
      resource_type_name: item.resource_types?.name || null
    })) as BillTypeItem[];
  };
  
  // Query hook
  const { 
    data: items, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['bill_types'],
    queryFn: fetchBillTypes,
  });
  
  // Add bill type mutation
  const addBillTypeMutation = useMutation({
    mutationFn: async (newItemData: { 
      name: string; 
      is_billable: boolean; 
      is_support: boolean; 
      non_billed: boolean;
      resource_type: string | null;
    }) => {
      // Check if item already exists to prevent duplicates
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.name.toLowerCase() === newItemData.name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${newItemData.name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from('bill_types')
        .insert(newItemData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill_types'] });
    },
  });
  
  // Update bill type mutation
  const updateBillTypeMutation = useMutation({
    mutationFn: async ({ 
      id, 
      name, 
      is_billable,
      is_support,
      non_billed,
      resource_type
    }: { 
      id: string; 
      name: string; 
      is_billable: boolean;
      is_support: boolean;
      non_billed: boolean;
      resource_type: string | null;
    }) => {
      // Check if another item with the same name already exists (excluding current item)
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.id !== id && item.name.toLowerCase() === name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from('bill_types')
        .update({ 
          name, 
          is_billable,
          is_support,
          non_billed,
          resource_type,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill_types'] });
    },
  });
  
  // Delete bill type mutation
  const deleteBillTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('bill_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill_types'] });
    },
  });
  
  const addItem = (value: { 
    name: string; 
    is_billable: boolean; 
    is_support: boolean; 
    non_billed: boolean;
    resource_type: string | null;
  }) => {
    if (!value.name.trim()) return;
    
    addBillTypeMutation.mutate(value, {
      onSuccess: () => {
        toast({
          title: "Bill type added",
          description: `"${value.name}" has been added.`,
        });
      },
      onError: (error) => {
        if (error instanceof Error && error.message.includes("already exists")) {
          console.log(error.message);
        } else {
          toast({
            title: "Error",
            description: `Failed to add bill type: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
    });
  };
  
  const updateItem = (
    id: string, 
    name: string, 
    originalName: string, 
    is_billable: boolean,
    is_support: boolean,
    non_billed: boolean,
    resource_type: string | null
  ) => {
    if (!name.trim()) return;
    
    updateBillTypeMutation.mutate({ 
      id, 
      name: name.trim(), 
      is_billable, 
      is_support, 
      non_billed,
      resource_type
    }, {
      onSuccess: () => {
        toast({
          title: "Bill type updated",
          description: `"${originalName}" has been updated.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update bill type: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const removeItem = (id: string, name: string) => {
    deleteBillTypeMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Bill type removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove bill type: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    isAddingItem: addBillTypeMutation.isPending,
    isUpdatingItem: updateBillTypeMutation.isPending,
    isRemovingItem: deleteBillTypeMutation.isPending
  };
};
