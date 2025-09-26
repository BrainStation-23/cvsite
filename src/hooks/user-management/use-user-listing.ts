
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SortColumn, SortOrder } from '../types/user-management';
import { ListUsersResponse } from '../types/supabase-responses';

export function useUserListing(state: ReturnType<typeof import('./use-user-state').useUserState>) {
  const { toast } = useToast();
  const {
    setUsers,
    setPagination,
    setIsLoading,
    searchQuery,
    setSearchQuery,
    filterCustomRoleId,
    setFilterCustomRoleId,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterSbuId,
    setFilterSbuId,
    filterManagerId,
    setFilterManagerId,
    filterResourceTypeId,
    setFilterResourceTypeId,
    filterExpertiseId,
    setFilterExpertiseId,
    filterTotalYears,
    setFilterTotalYears,
    filterCompanyYears,
    setFilterCompanyYears
  } = state;
  
  // Fetch users
  const fetchUsers = async (options: {
    page?: number;
    perPage?: number;
    search?: string | null;
    customRoleId?: string | null;
    sortColumn?: SortColumn;
    sortDirection?: SortOrder;
    sbuId?: string | null;
    managerId?: string | null;
    resourceTypeId?: string | null;
    expertiseId?: string | null;
    totalYears?: [number, number] | null;
    companyYears?: [number, number] | null;
  } = {}) => {
    const {
      page = state.pagination.page,
      perPage = state.pagination.perPage,
      search = searchQuery,
      customRoleId = filterCustomRoleId,
      sortColumn = sortBy,
      sortDirection = sortOrder,
      sbuId = filterSbuId,
      managerId = filterManagerId,
      resourceTypeId = filterResourceTypeId,
      expertiseId = filterExpertiseId,
      totalYears = filterTotalYears,
      companyYears = filterCompanyYears
    } = options;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('list_users', {
        search_query: search || null,
        filter_custom_role_id: customRoleId || null,
        filter_sbu_id: sbuId || null,
        filter_manager_id: managerId || null,
        filter_resource_type_id: resourceTypeId || null,
        filter_expertise_id: expertiseId || null,
        filter_min_total_years: totalYears ? totalYears[0] : null,
        filter_max_total_years: totalYears ? totalYears[1] : null,
        filter_min_company_years: companyYears ? companyYears[0] : null,
        filter_max_company_years: companyYears ? companyYears[1] : null,
        page_number: page,
        items_per_page: perPage,
        sort_by: sortColumn,
        sort_order: sortDirection
      });
      
      if (error) throw error;
      
      if (!data) {
        console.error('No data returned from list_users RPC');
        throw new Error('No data returned from server');
      }
      
      // Type assertion to handle the response structure
      const response = data as unknown as ListUsersResponse;
      
      // Map the returned data to our UserData format with extended information
      const formattedUsers = response.users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        customRoleId: user.custom_role_id || null,
        customRoleName: user.custom_role_name || null,
        sbuContext: user.sbu_context || null,
        sbuContextName: user.sbu_context_name || null,
        employeeId: user.employee_id || '',
        sbuId: user.sbu_id || null,
        sbuName: user.sbu_name || null,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at || undefined,
        dateOfJoining: user.date_of_joining || null,
        careerStartDate: user.career_start_date || null,
        managerId: user.manager_id || null,
        managerName: user.manager_name || null,
        expertiseId: user.expertise_id || null,
        expertiseName: user.expertise_name || null,
        resourceTypeId: user.resource_type_id || null,
        resourceTypeName: user.resource_type_name || null,
      }));
      
      setUsers(formattedUsers);
      setPagination({
        totalCount: response.pagination.total_count,
        filteredCount: response.pagination.filtered_count,
        page: response.pagination.page,
        perPage: response.pagination.per_page,
        pageCount: response.pagination.page_count
      });
      
      // Update state with the query parameters
      setSearchQuery(search);
      setFilterCustomRoleId(customRoleId);
      setSortBy(sortColumn);
      setSortOrder(sortDirection);
      setFilterSbuId(sbuId);
      setFilterManagerId(managerId);
      setFilterResourceTypeId(resourceTypeId);
      setFilterExpertiseId(expertiseId);
      if (totalYears) setFilterTotalYears(totalYears);
      if (companyYears) setFilterCompanyYears(companyYears);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error fetching users',
        description: error.message || 'There was an error fetching users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchUsers({ page: newPage });
  };
  
  // Reset filters
  const resetFilters = () => {
    fetchUsers({
      page: 1,
      search: null,
      customRoleId: null,
      sortColumn: 'created_at',
      sortDirection: 'desc',
      sbuId: null,
      managerId: null,
      resourceTypeId: null,
      expertiseId: null,
      totalYears: [0, 50],
      companyYears: [0, 30]
    });
  };

  return {
    fetchUsers,
    handlePageChange,
    resetFilters
  };
}
