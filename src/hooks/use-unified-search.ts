
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SearchResult {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  current_designation: string;
  biography: string;
  sbu_name: string;
  expertise_type: string;
  resource_type: string;
  total_experience_years: number;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  current_project: string;
  search_rank: number;
}

export interface SearchPagination {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

export interface SearchResponse {
  profiles: SearchResult[];
  pagination: SearchPagination;
}

interface UseUnifiedSearchProps {
  initialPage?: number;
  initialPerPage?: number;
}

export function useUnifiedSearch({ 
  initialPage = 1, 
  initialPerPage = 10 
}: UseUnifiedSearchProps = {}) {
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<SearchPagination>({
    total_count: 0,
    filtered_count: 0,
    page: initialPage,
    per_page: initialPerPage,
    page_count: 0
  });
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minExperience, setMinExperience] = useState<number | null>(null);
  const [maxExperience, setMaxExperience] = useState<number | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null);
  const [sbuFilter, setSbuFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const search = useCallback(async (options: {
    query?: string;
    minExperience?: number | null;
    maxExperience?: number | null;
    availability?: string | null;
    sbu?: string | null;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const {
      query = searchQuery,
      minExperience: minExp = minExperience,
      maxExperience: maxExp = maxExperience,
      availability = availabilityFilter,
      sbu = sbuFilter,
      page = pagination.page,
      perPage = pagination.per_page,
      sortBy: sort = sortBy,
      sortOrder: order = sortOrder
    } = options;

    setIsLoading(true);

    try {
      console.log('Performing unified search with:', {
        query, minExp, maxExp, availability, sbu, page, perPage, sort, order
      });

      const { data, error } = await supabase.rpc('search_employees', {
        search_query: query || null,
        min_experience_years: minExp,
        max_experience_years: maxExp,
        availability_filter: availability,
        sbu_filter: sbu,
        page_number: page,
        items_per_page: perPage,
        sort_by: sort,
        sort_order: order
      });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      if (!data) {
        console.error('No data returned from search');
        throw new Error('No data returned from server');
      }

      console.log('Search response:', data);
      
      // Properly cast the response through unknown first
      const response = data as unknown as SearchResponse;
      
      setProfiles(response.profiles || []);
      setPagination({
        total_count: response.pagination.total_count,
        filtered_count: response.pagination.filtered_count,
        page: response.pagination.page,
        per_page: response.pagination.per_page,
        page_count: response.pagination.page_count
      });
      
      // Update filter states
      setSearchQuery(query);
      setMinExperience(minExp);
      setMaxExperience(maxExp);
      setAvailabilityFilter(availability);
      setSbuFilter(sbu);
      setSortBy(sort);
      setSortOrder(order);

    } catch (error: any) {
      console.error('Search failed:', error);
      toast({
        title: 'Search Error',
        description: error.message || 'Failed to search employees. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, minExperience, maxExperience, availabilityFilter, sbuFilter, pagination.page, pagination.per_page, sortBy, sortOrder, toast]);

  const handleSearch = useCallback((query: string) => {
    search({ query, page: 1 });
  }, [search]);

  const handlePageChange = useCallback((newPage: number) => {
    search({ page: newPage });
  }, [search]);

  const handleFilterChange = useCallback((filters: {
    minExperience?: number | null;
    maxExperience?: number | null;
    availability?: string | null;
    sbu?: string | null;
  }) => {
    search({ ...filters, page: 1 });
  }, [search]);

  const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
    search({ sortBy, sortOrder });
  }, [search]);

  const resetFilters = useCallback(() => {
    search({
      query: '',
      minExperience: null,
      maxExperience: null,
      availability: null,
      sbu: null,
      sortBy: 'relevance',
      sortOrder: 'desc',
      page: 1
    });
  }, [search]);

  return {
    profiles,
    isLoading,
    pagination,
    searchQuery,
    minExperience,
    maxExperience,
    availabilityFilter,
    sbuFilter,
    sortBy,
    sortOrder,
    search,
    handleSearch,
    handlePageChange,
    handleFilterChange,
    handleSortChange,
    resetFilters
  };
}
