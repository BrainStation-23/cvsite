
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/ui/use-toast';

export interface DepartmentItem {
  id: string;
  name: string;
  full_form: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentFormData {
  name: string;
  full_form?: string;
}

export const useDepartmentSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch departments
  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as DepartmentItem[];
  };
  
  // Query hook
  const { 
    data: items, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });
  
  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (department: DepartmentFormData) => {
      // Check if department already exists
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.name.toLowerCase() === department.name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${department.name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: department.name,
          full_form: department.full_form || null
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-search'] });
    },
  });
  
  // Update department mutation
  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ id, department }: { id: string; department: DepartmentFormData }) => {
      const { data, error } = await supabase
        .from('departments')
        .update({
          name: department.name,
          full_form: department.full_form || null
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-search'] });
    },
  });
  
  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-search'] });
    },
  });
  
  const addItem = (department: DepartmentFormData) => {
    if (!department.name.trim()) return;
    
    addDepartmentMutation.mutate(department, {
      onSuccess: () => {
        toast({
          title: "Department added",
          description: `"${department.name}" has been added.`,
        });
      },
      onError: (error) => {
        if (error instanceof Error && error.message.includes("already exists")) {
          toast({
            title: "Department already exists",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to add department: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
    });
  };
  
  const updateItem = (id: string, department: DepartmentFormData) => {
    updateDepartmentMutation.mutate({ id, department }, {
      onSuccess: () => {
        toast({
          title: "Department updated",
          description: `Department has been updated to "${department.name}".`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update department: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const removeItem = (id: string, name: string) => {
    deleteDepartmentMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Department removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove department: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    isAddingItem: addDepartmentMutation.isPending,
    isUpdatingItem: updateDepartmentMutation.isPending,
    isRemovingItem: deleteDepartmentMutation.isPending
  };
};
