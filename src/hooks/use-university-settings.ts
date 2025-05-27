
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UniversityItem {
  id: string;
  name: string;
  type: 'Public' | 'Private' | 'International' | 'Special';
  acronyms: string | null;
  created_at: string;
  updated_at: string;
}

export interface UniversityFormData {
  name: string;
  type: 'Public' | 'Private' | 'International' | 'Special';
  acronyms?: string;
}

// Helper function to format type with proper case
const formatUniversityType = (type: string): 'Public' | 'Private' | 'International' | 'Special' => {
  const lowerType = type.toLowerCase();
  switch (lowerType) {
    case 'public':
      return 'Public';
    case 'private':
      return 'Private';
    case 'international':
      return 'International';
    case 'special':
      return 'Special';
    default:
      // If it's already properly formatted, return as is
      if (['Public', 'Private', 'International', 'Special'].includes(type)) {
        return type as 'Public' | 'Private' | 'International' | 'Special';
      }
      return 'Public'; // Default fallback
  }
};

export const useUniversitySettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch universities
  const fetchUniversities = async () => {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as UniversityItem[];
  };
  
  // Query hook
  const { 
    data: items, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['universities'],
    queryFn: fetchUniversities,
  });
  
  // Add university mutation
  const addUniversityMutation = useMutation({
    mutationFn: async (university: UniversityFormData) => {
      // Check if university already exists
      const existingItems = items || [];
      const itemExists = existingItems.some(item => 
        item.name.toLowerCase() === university.name.toLowerCase()
      );
      
      if (itemExists) {
        throw new Error(`"${university.name}" already exists`);
      }
      
      const { data, error } = await supabase
        .from('universities')
        .insert({
          name: university.name,
          type: formatUniversityType(university.type),
          acronyms: university.acronyms || null
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
    },
  });
  
  // Update university mutation
  const updateUniversityMutation = useMutation({
    mutationFn: async ({ id, university }: { id: string; university: UniversityFormData }) => {
      const { data, error } = await supabase
        .from('universities')
        .update({
          name: university.name,
          type: formatUniversityType(university.type),
          acronyms: university.acronyms || null
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
    },
  });
  
  // Delete university mutation
  const deleteUniversityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('universities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
    },
  });

  // Bulk import mutation - now only imports valid universities
  const bulkImportMutation = useMutation({
    mutationFn: async (universities: UniversityFormData[]) => {
      if (universities.length === 0) {
        throw new Error('No universities to import');
      }

      const { data, error } = await supabase
        .from('universities')
        .insert(
          universities.map(university => ({
            name: university.name,
            type: formatUniversityType(university.type),
            acronyms: university.acronyms || null
          }))
        )
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
    },
  });
  
  const addItem = (university: UniversityFormData) => {
    addUniversityMutation.mutate(university, {
      onSuccess: () => {
        toast({
          title: "University added",
          description: `"${university.name}" has been added.`,
        });
      },
      onError: (error) => {
        if (error instanceof Error && error.message.includes("already exists")) {
          console.log(error.message);
        } else {
          toast({
            title: "Error",
            description: `Failed to add university: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
    });
  };
  
  const updateItem = (id: string, university: UniversityFormData) => {
    updateUniversityMutation.mutate({ id, university }, {
      onSuccess: () => {
        toast({
          title: "University updated",
          description: `"${university.name}" has been updated.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update university: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const removeItem = (id: string, name: string) => {
    deleteUniversityMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "University removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove university: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  const bulkImportItems = (universities: UniversityFormData[]) => {
    bulkImportMutation.mutate(universities, {
      onSuccess: (result) => {
        toast({
          title: "Import successful",
          description: `${result.length} universities imported successfully.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : 'Unknown error',
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
    bulkImportItems,
    isAddingItem: addUniversityMutation.isPending,
    isUpdatingItem: updateUniversityMutation.isPending,
    isRemovingItem: deleteUniversityMutation.isPending,
    isBulkImporting: bulkImportMutation.isPending
  };
};
