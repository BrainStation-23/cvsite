
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DesignationItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DesignationSearchParams {
  searchQuery?: string | null;
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface DesignationSearchResult {
  designations: DesignationItem[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export const useDesignationSearch = (params: DesignationSearchParams = {}) => {
  const {
    searchQuery = null,
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc'
  } = params;

  return useQuery({
    queryKey: ['designation-search', searchQuery, page, perPage, sortBy, sortOrder],
    queryFn: async (): Promise<DesignationSearchResult> => {
      let query = supabase
        .from('designations')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Get total count for unfiltered data
      const { count: totalCount } = await supabase
        .from('designations')
        .select('*', { count: 'exact', head: true });

      const filteredCount = count || 0;
      const pageCount = Math.ceil(filteredCount / perPage);

      return {
        designations: data || [],
        pagination: {
          total_count: totalCount || 0,
          filtered_count: filteredCount,
          page,
          per_page: perPage,
          page_count: pageCount
        }
      };
    },
  });
};
