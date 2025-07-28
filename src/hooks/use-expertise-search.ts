
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExpertiseItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ExpertiseSearchParams {
  searchQuery?: string | null;
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ExpertiseSearchResult {
  expertiseTypes: ExpertiseItem[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export const useExpertiseSearch = (params: ExpertiseSearchParams = {}) => {
  const {
    searchQuery = null,
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc'
  } = params;

  return useQuery({
    queryKey: ['expertise-search', searchQuery, page, perPage, sortBy, sortOrder],
    queryFn: async (): Promise<ExpertiseSearchResult> => {
      let query = supabase.from('expertise_types').select('*', { count: 'exact' });
      
      // Apply search filter
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('expertise_types')
        .select('*', { count: 'exact', head: true });
      
      // Get filtered count
      let countQuery = supabase.from('expertise_types').select('*', { count: 'exact', head: true });
      if (searchQuery) {
        countQuery = countQuery.ilike('name', `%${searchQuery}%`);
      }
      const { count: filteredCount } = await countQuery;
      
      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * perPage, page * perPage - 1);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        expertiseTypes: data || [],
        pagination: {
          total_count: totalCount || 0,
          filtered_count: filteredCount || 0,
          page,
          per_page: perPage,
          page_count: Math.ceil((filteredCount || 0) / perPage)
        }
      };
    },
  });
};
