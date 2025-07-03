
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the shape of a setting item
export interface SettingItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Define valid table names for type safety
export type SettingTableName = 'universities' | 'departments' | 'degrees' | 'designations' | 'references' | 'sbus' | 'hr_contacts' | 'resource_types' | 'bill_types' | 'project_types';

export const usePlatformSettings = (table: SettingTableName) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch data from the specified table
  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as SettingItem[];
  };
  
  // Query hook for the specific table
  const { 
    data: items, 
    isLoading,
    error
  } = useQuery({
    queryKey: [table],
    queryFn: fetchSettings,
  });
  
  // Add setting mutation
  const addSettingMutation = useMutation({
    mutationFn: async (name: string) => {
      // Check if item already exists to prevent duplicates
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.name.toLowerCase() === name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from(table)
        .insert({ name })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });
  
  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      // Check if another item with the same name already exists (excluding current item)
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.id !== id && item.name.toLowerCase() === name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from(table)
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });
  
  // Delete setting mutation
  const deleteSettingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });
  
  const addItem = (value: string) => {
    if (!value.trim()) return;
    
    // Perform the mutation
    addSettingMutation.mutate(value.trim(), {
      onSuccess: () => {
        toast({
          title: "Item added",
          description: `"${value}" has been added.`,
        });
      },
      onError: (error) => {
        // Don't show error toast for duplicate items when adding multiple items
        if (error instanceof Error && error.message.includes("already exists")) {
          console.log(error.message);
        } else {
          toast({
            title: "Error",
            description: `Failed to add item: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
    });
  };
  
  const updateItem = (id: string, name: string, originalName: string) => {
    if (!name.trim()) return;
    
    // Perform the mutation
    updateSettingMutation.mutate({ id, name: name.trim() }, {
      onSuccess: () => {
        toast({
          title: "Item updated",
          description: `"${originalName}" has been updated to "${name}".`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const removeItem = (id: string, name: string) => {
    // Perform the mutation
    deleteSettingMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Item removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove item: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    isAddingItem: addSettingMutation.isPending,
    isUpdatingItem: updateSettingMutation.isPending,
    isRemovingItem: deleteSettingMutation.isPending
  };
};
