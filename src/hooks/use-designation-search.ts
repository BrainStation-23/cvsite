
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
  ensureDesignations?: string[]; // Ensure specific designations are included
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
    sortOrder = 'asc',
    ensureDesignations = []
  } = params;

  return useQuery({
    queryKey: ['designation-search', searchQuery, page, perPage, sortBy, sortOrder, ensureDesignations],
    queryFn: async (): Promise<DesignationSearchResult> => {
      let query = supabase.from('designations').select('*', { count: 'exact' });
      
      // Apply search filter or ensure specific designations are included
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      } else if (ensureDesignations.length > 0) {
        // If no search but we need to ensure specific designations, include them
        query = query.or(`name.in.(${ensureDesignations.map(d => `"${d}"`).join(',')})`);
      }
      
      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('designations')
        .select('*', { count: 'exact', head: true });
      
      // Get filtered count
      let countQuery = supabase.from('designations').select('*', { count: 'exact', head: true });
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
        designations: data || [],
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
