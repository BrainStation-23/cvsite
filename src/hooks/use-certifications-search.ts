
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CertificationRecord {
  first_name: string;
  last_name: string;
  employee_id: string;
  sbu_name: string;
  sbu_id: string;
  id: string;
  profile_id: string;
  title: string;
  provider: string;
  certification_date: string;
  description: string;
  certificate_url: string;
  is_renewable: boolean;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

interface CertificationsResponse {
  certifications: CertificationRecord[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export function useCertificationsSearch() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [certifications, setCertifications] = useState<CertificationRecord[]>([]);
  const [pagination, setPagination] = useState({
    total_count: 0,
    filtered_count: 0,
    page: 1,
    per_page: 10,
    page_count: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [sbuFilter, setSbuFilter] = useState('');
  const [sortBy, setSortBy] = useState('certification_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchCertifications = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('search_certifications', {
        search_query: searchQuery || null,
        provider_filter: (providerFilter && providerFilter !== 'all') ? providerFilter : null,
        sbu_filter: (sbuFilter && sbuFilter !== 'all') ? sbuFilter : null,
        page_number: currentPage,
        items_per_page: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (error) throw error;

      // Handle the JSON response properly
      if (data && typeof data === 'object' && 'certifications' in data && 'pagination' in data) {
        const response = data as unknown as CertificationsResponse;
        setCertifications(response.certifications || []);
        setPagination(response.pagination);
      } else {
        // Fallback for unexpected response format
        setCertifications([]);
        setPagination({
          total_count: 0,
          filtered_count: 0,
          page: currentPage,
          per_page: itemsPerPage,
          page_count: 0
        });
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certifications',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [searchQuery, providerFilter, sbuFilter, sortBy, sortOrder, currentPage, itemsPerPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleProviderFilter = (provider: string) => {
    setProviderFilter(provider);
    setCurrentPage(1);
  };

  const handleSbuFilter = (sbu: string) => {
    setSbuFilter(sbu);
    setCurrentPage(1);
  };

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setProviderFilter('');
    setSbuFilter('');
    setCurrentPage(1);
  };

  return {
    certifications,
    pagination,
    isLoading,
    searchQuery,
    providerFilter,
    sbuFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    handleSearch,
    handleProviderFilter,
    handleSbuFilter,
    handleSort,
    handlePageChange,
    handleItemsPerPageChange,
    handleClearFilters,
    refetch: fetchCertifications
  };
}
