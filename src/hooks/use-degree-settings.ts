
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DegreeFormData, DegreeItem } from '@/utils/degreeCsvUtils';

interface DegreeSearchResponse {
  degrees: DegreeItem[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export const useDegreeSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch degrees using RPC function
  const fetchDegrees = async (): Promise<DegreeItem[]> => {
    const { data, error } = await supabase.rpc('search_degrees');
    
    if (error) throw error;
    const response = data as unknown as DegreeSearchResponse;
    return response?.degrees || [];
  };
  
  // Query hook for degrees
  const { 
    data: degrees, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['degrees'],
    queryFn: fetchDegrees,
  });
  
  // Add degree mutation
  const addDegreeMutation = useMutation({
    mutationFn: async (degreeData: DegreeFormData) => {
      const { data, error } = await supabase
        .from('degrees')
        .insert({
          name: degreeData.name,
          full_form: degreeData.full_form
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['degrees'] });
    },
  });
  
  // Bulk import degrees mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (degrees: DegreeFormData[]) => {
      const { data, error } = await supabase
        .from('degrees')
        .insert(degrees)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['degrees'] });
    },
  });
  
  // Delete degree mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('degrees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['degrees'] });
    },
  });
  
  const addDegree = (degreeData: DegreeFormData) => {
    addDegreeMutation.mutate(degreeData, {
      onSuccess: () => {
        toast({
          title: "Degree added",
          description: `"${degreeData.name}" has been added.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to add degree: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  const bulkImportDegrees = (degrees: DegreeFormData[]) => {
    bulkImportMutation.mutate(degrees, {
      onSuccess: (data) => {
        toast({
          title: "Import successful",
          description: `${data?.length || 0} degrees have been imported.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Import failed",
          description: `Failed to import degrees: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const deleteDegree = (id: string, name: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Degree removed",
          description: `"${name}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to remove degree: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });
  };

  return {
    degrees: degrees || [],
    isLoading,
    error,
    addDegree,
    bulkImportDegrees,
    deleteDegree,
    isAddingDegree: addDegreeMutation.isPending,
    isBulkImporting: bulkImportMutation.isPending,
    isDeletingDegree: deleteMutation.isPending
  };
};
