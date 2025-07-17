
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DepartmentItem {
  id: string;
  name: string;
  full_form: string | null;
  created_at: string;
  updated_at: string;
}

interface DepartmentSearchParams {
  searchQuery?: string | null;
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'full_form' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

interface DepartmentSearchResult {
  departments: DepartmentItem[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export const useDepartmentSearch = (params: DepartmentSearchParams = {}) => {
  const {
    searchQuery = null,
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc'
  } = params;

  return useQuery({
    queryKey: ['department-search', searchQuery, page, perPage, sortBy, sortOrder],
    queryFn: async (): Promise<DepartmentSearchResult> => {
      const { data, error } = await supabase.rpc('search_departments', {
        search_query: searchQuery,
        page_number: page,
        items_per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (error) throw error;
      
      // Type assertion with proper validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from search_departments function');
      }
      
      return data as unknown as DepartmentSearchResult;
    },
  });
};
