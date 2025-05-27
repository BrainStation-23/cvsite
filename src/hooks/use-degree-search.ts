
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseDegreeSearchProps {
  searchQuery?: string;
  page?: number;
  itemsPerPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useDegreeSearch = ({
  searchQuery = '',
  page = 1,
  itemsPerPage = 10,
  sortBy = 'name',
  sortOrder = 'asc'
}: UseDegreeSearchProps = {}) => {
  
  const searchDegrees = async () => {
    const { data, error } = await supabase.rpc('search_degrees', {
      search_query: searchQuery || null,
      page_number: page,
      items_per_page: itemsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder
    });
    
    if (error) throw error;
    return data;
  };
  
  return useQuery({
    queryKey: ['degrees', 'search', searchQuery, page, itemsPerPage, sortBy, sortOrder],
    queryFn: searchDegrees,
  });
};
