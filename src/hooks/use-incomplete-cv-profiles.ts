
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

interface PaginatedResponse {
  profiles: IncompleteProfile[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
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
      
      const { data, error } = await supabase.rpc('get_incomplete_cv_profiles_paginated', {
        resource_type_filter: resourceTypeFilter || null,
        search_term: searchTerm || null,
        page_number: page,
        page_size: pageSize,
      });

      if (error) {
        console.error('Error fetching incomplete CV profiles:', error);
        throw error;
      }

      const response = data as unknown as PaginatedResponse;
      return {
        profiles: response.profiles || [],
        total_count: response.pagination.filtered_count,
        total_pages: response.pagination.page_count,
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
