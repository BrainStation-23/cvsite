import { supabase } from '../../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SortColumn, SortOrder } from '../types/user-management';
import { UserRole } from '@/types';
import { ListUsersResponse } from '../types/supabase-responses';

export function useUserListing(state: ReturnType<typeof import('./use-user-state').useUserState>) {
  const { toast } = useToast();
  const {
    setUsers,
    setPagination,
    setIsLoading,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = state;
  
  // Fetch users
  const fetchUsers = async (options: {
    page?: number;
    perPage?: number;
    search?: string | null;
    role?: UserRole | null;
    sortColumn?: SortColumn;
    sortDirection?: SortOrder;
  } = {}) => {
    const {
      page = state.pagination.page,
      perPage = state.pagination.perPage,
      search = searchQuery,
      role = filterRole,
      sortColumn = sortBy,
      sortDirection = sortOrder
    } = options;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('list_users', {
        search_query: search || null,
        filter_role: role || null,
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
      
      // Map the returned data to our UserData format
      const formattedUsers = response.users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        role: user.role || 'employee',
        employeeId: user.employee_id || '', // Fixed: now accessing the correct property
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at || undefined
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
      setFilterRole(role);
      setSortBy(sortColumn);
      setSortOrder(sortDirection);
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
      role: null,
      sortColumn: 'created_at',
      sortDirection: 'desc'
    });
  };

  return {
    fetchUsers,
    handlePageChange,
    resetFilters
  };
}
