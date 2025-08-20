
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface IncompleteProfile {
  profile_id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  resource_type_id: string;
  resource_type_name: string;
  completion_score: number;
  total_sections: number;
  missing_sections: string[];
  missing_count: number;
}

interface UseIncompleteProfilesOptions {
  resourceTypeFilter?: string;
  page?: number;
  pageSize?: number;
  searchTerm?: string;
}

export function useIncompleteCvProfiles({
  resourceTypeFilter,
  page = 1,
  pageSize = 10,
  searchTerm,
}: UseIncompleteProfilesOptions = {}) {
  return useQuery({
    queryKey: ['incomplete-cv-profiles', resourceTypeFilter, page, pageSize, searchTerm],
    queryFn: async () => {
      console.log('Fetching incomplete profiles:', { resourceTypeFilter, page, pageSize, searchTerm });
      
      // Use the existing RPC function instead of the non-existent paginated one
      const { data, error } = await supabase.rpc('get_incomplete_cv_profiles', {
        resource_type_filter: resourceTypeFilter || null,
      });

      if (error) {
        console.error('Error fetching incomplete CV profiles:', error);
        throw error;
      }

      // Filter and paginate on the client side for now
      let filteredData = (data || []) as IncompleteProfile[];
      
      // Apply search filter if provided
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(profile => 
          profile.first_name.toLowerCase().includes(searchLower) ||
          profile.last_name.toLowerCase().includes(searchLower) ||
          profile.employee_id.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        profiles: paginatedData,
        total_count: filteredData.length,
        total_pages: Math.ceil(filteredData.length / pageSize),
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

// Keep the original hook for backward compatibility but with a smaller default page size
export function useIncompleteCvProfilesLegacy(resourceTypeFilter?: string) {
  return useQuery({
    queryKey: ['incomplete-cv-profiles-legacy', resourceTypeFilter],
    queryFn: async () => {
      console.log('Fetching incomplete profiles (legacy):', { resourceTypeFilter });
      
      const { data, error } = await supabase.rpc('get_incomplete_cv_profiles', {
        resource_type_filter: resourceTypeFilter || null,
      });

      if (error) {
        console.error('Error fetching incomplete CV profiles:', error);
        throw error;
      }

      return (data || []) as IncompleteProfile[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
