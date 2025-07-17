
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DesignationItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface DesignationSearchParams {
  searchQuery?: string | null;
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  ensureDesignations?: string[]; // Add this to ensure specific designations are included
}

interface DesignationSearchResult {
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
    perPage = 50,
    sortBy = 'name',
    sortOrder = 'asc',
    ensureDesignations = []
  } = params;

  return useQuery({
    queryKey: ['designation-search', searchQuery, page, perPage, sortBy, sortOrder, ensureDesignations],
    queryFn: async (): Promise<DesignationSearchResult> => {
      console.log('=== Designation Search Query ===');
      console.log('Search query:', searchQuery);
      console.log('Ensure designations:', ensureDesignations);

      // First, get the main query results
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

      let mainResults = data || [];
      console.log('Main results count:', mainResults.length);

      // If we have designations to ensure, fetch them separately
      let ensuredDesignations: DesignationItem[] = [];
      if (ensureDesignations.length > 0) {
        console.log('Fetching ensured designations...');
        const { data: ensuredData, error: ensuredError } = await supabase
          .from('designations')
          .select('*')
          .in('name', ensureDesignations);

        if (ensuredError) {
          console.error('Error fetching ensured designations:', ensuredError);
        } else {
          ensuredDesignations = ensuredData || [];
          console.log('Ensured designations found:', ensuredDesignations.length);
        }
      }

      // Merge results, avoiding duplicates
      const mainResultNames = new Set(mainResults.map(d => d.name));
      const additionalDesignations = ensuredDesignations.filter(d => !mainResultNames.has(d.name));
      
      // If we have additional designations to include, we need to make room
      let finalResults: DesignationItem[] = [];
      if (additionalDesignations.length > 0) {
        // Add ensured designations first (they take priority)
        finalResults = [...ensuredDesignations];
        
        // Then add main results up to the limit, avoiding duplicates
        const remainingSlots = perPage - ensuredDesignations.length;
        const remainingMainResults = mainResults.slice(0, Math.max(0, remainingSlots));
        finalResults = [...finalResults, ...remainingMainResults];
        
        console.log('Final results with ensured designations:', finalResults.length);
      } else {
        finalResults = mainResults;
      }

      // Get total count for unfiltered data
      const { count: totalCount } = await supabase
        .from('designations')
        .select('*', { count: 'exact', head: true });

      const filteredCount = count || 0;
      const pageCount = Math.ceil(filteredCount / perPage);

      console.log('Total designations in DB:', totalCount);
      console.log('Filtered count:', filteredCount);
      console.log('Returning designations:', finalResults.length);

      return {
        designations: finalResults,
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
