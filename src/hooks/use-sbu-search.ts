
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SbuItem {
  id: string;
  name: string;
  sbu_head_email: string;
  created_at: string;
  updated_at: string;
}

export interface SbuSearchParams {
  searchQuery?: string | null;
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'sbu_head_email' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface SbuSearchResult {
  sbus: SbuItem[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export const useSbuSearch = (params: SbuSearchParams = {}) => {
  const {
    searchQuery = null,
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc'
  } = params;

  return useQuery({
    queryKey: ['sbu-search', searchQuery, page, perPage, sortBy, sortOrder],
    queryFn: async (): Promise<SbuSearchResult> => {
      let query = supabase.from('sbus').select('*', { count: 'exact' });
      
      // Apply search filter
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,sbu_head_email.ilike.%${searchQuery}%`);
      }
      
      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('sbus')
        .select('*', { count: 'exact', head: true });
      
      // Get filtered count
      let countQuery = supabase.from('sbus').select('*', { count: 'exact', head: true });
      if (searchQuery) {
        countQuery = countQuery.or(`name.ilike.%${searchQuery}%,sbu_head_email.ilike.%${searchQuery}%`);
      }
      const { count: filteredCount } = await countQuery;
      
      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * perPage, page * perPage - 1);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        sbus: data || [],
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
