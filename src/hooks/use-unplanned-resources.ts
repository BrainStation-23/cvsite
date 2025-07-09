
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UnplannedResource {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  current_designation: string;
  sbu_name: string;
  manager_name: string;
}

export function useUnplannedResources() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  const { data: unplannedData, isLoading, error } = useQuery({
    queryKey: ['resource-planning-unplanned', searchQuery, selectedSbu, selectedManager],
    queryFn: async () => {
      console.log('Unplanned Resource Planning Query:', {
        searchQuery,
        selectedSbu,
        selectedManager
      });

      const { data: rpcData, error } = await supabase.rpc('get_unplanned_resources', {
        search_query: searchQuery || null,
        sbu_filter: selectedSbu,
        manager_filter: selectedManager
      });

      if (error) {
        console.error('Unplanned RPC call error:', error);
        throw error;
      }
      
      console.log('Unplanned RPC response:', rpcData);
      
      if (Array.isArray(rpcData)) {
        return rpcData as unknown as UnplannedResource[];
      }
      return [];
    }
  });

  // Handle errors by showing toast when error occurs
  if (error) {
    console.error('Query error:', error);
    toast({
      title: 'Error Loading Unplanned Resources',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      variant: 'destructive',
    });
  }

  return {
    unplannedResources: unplannedData || [],
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
  };
}
