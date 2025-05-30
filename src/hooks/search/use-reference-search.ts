
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReferenceItem {
  id: string;
  name: string;
  email: string;
  designation: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export interface ReferenceSearchParams {
  searchQuery?: string | null;
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'email' | 'designation' | 'company' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ReferenceSearchResult {
  references: ReferenceItem[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export const useReferenceSearch = (params: ReferenceSearchParams = {}) => {
  const {
    searchQuery = null,
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc'
  } = params;

  return useQuery({
    queryKey: ['reference-search', searchQuery, page, perPage, sortBy, sortOrder],
    queryFn: async (): Promise<ReferenceSearchResult> => {
      const { data, error } = await supabase.rpc('search_references', {
        search_query: searchQuery,
        page_number: page,
        items_per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (error) throw error;
      
      // Type guard to ensure we have the correct structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from search_references');
      }

      // Cast to unknown first, then to our expected type
      return data as unknown as ReferenceSearchResult;
    },
  });
};
