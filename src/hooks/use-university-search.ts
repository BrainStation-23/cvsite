
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UniversityItem } from './use-university-settings';

interface UniversitySearchParams {
  searchQuery?: string | null;
  typeFilter?: string | null;
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'type' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

interface UniversitySearchResult {
  universities: UniversityItem[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export const useUniversitySearch = (params: UniversitySearchParams = {}) => {
  const {
    searchQuery = null,
    typeFilter = null,
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc'
  } = params;

  return useQuery({
    queryKey: ['university-search', searchQuery, typeFilter, page, perPage, sortBy, sortOrder],
    queryFn: async (): Promise<UniversitySearchResult> => {
      const { data, error } = await supabase.rpc('search_universities', {
        search_query: searchQuery,
        type_filter: typeFilter,
        page_number: page,
        items_per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (error) throw error;
      
      // Type assertion with proper validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from search_universities function');
      }
      
      return data as unknown as UniversitySearchResult;
    },
  });
};
