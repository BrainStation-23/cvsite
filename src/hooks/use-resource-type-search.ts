
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ResourceType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ResourceTypeSearchParams {
  searchQuery?: string | null;
  page?: number;
  perPage?: number;
}

interface ResourceTypeSearchResult {
  resourceTypes: ResourceType[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export const useResourceTypeSearch = (params: ResourceTypeSearchParams) => {
  return useQuery({
    queryKey: ['resource-types', params],
    queryFn: async (): Promise<ResourceTypeSearchResult> => {
      let query = supabase
        .from('resource_types')
        .select('*', { count: 'exact' });

      // Apply search filter if provided
      if (params.searchQuery) {
        query = query.ilike('name', `%${params.searchQuery}%`);
      }

      // Apply pagination
      const page = params.page || 1;
      const perPage = params.perPage || 10;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      query = query.range(from, to).order('name', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        resourceTypes: data || [],
        pagination: {
          total_count: count || 0,
          filtered_count: count || 0,
          page,
          per_page: perPage,
          page_count: Math.ceil((count || 0) / perPage)
        }
      };
    },
  });
};
