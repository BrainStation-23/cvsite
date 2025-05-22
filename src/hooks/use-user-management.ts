
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { User, UserRole } from '../types';

export type SortColumn = 'email' | 'first_name' | 'last_name' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface UserData extends User {
  createdAt?: string;
  lastSignIn?: string;
}

export interface PaginationData {
  totalCount: number;
  filteredCount: number;
  page: number;
  perPage: number;
  pageCount: number;
}

// Define the interface for the RPC function response
interface ListUsersResponse {
  users: Array<{
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    first_name: string | null;
    last_name: string | null;
    role: UserRole;
  }>;
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

// Define the interface for the RPC function parameters
interface ListUsersParams {
  search_query: string | null;
  filter_role: UserRole | null;
  page_number: number;
  items_per_page: number;
  sort_by: SortColumn;
  sort_order: SortOrder;
}

interface UseUserManagementProps {
  initialPage?: number;
  initialPerPage?: number;
}

export function useUserManagement({ 
  initialPage = 1, 
  initialPerPage = 10 
}: UseUserManagementProps = {}) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    totalCount: 0,
    filteredCount: 0,
    page: initialPage,
    perPage: initialPerPage,
    pageCount: 0
  });
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<UserRole | null>(null);
  const [sortBy, setSortBy] = useState<SortColumn>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
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
      page = pagination.page,
      perPage = pagination.perPage,
      search = searchQuery,
      role = filterRole,
      sortColumn = sortBy,
      sortDirection = sortOrder
    } = options;
    
    setIsLoading(true);
    
    try {
      // Fix: Remove type parameters from the rpc call as they're causing issues
      // The Supabase client will handle the type inference based on the function name
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
  
  // Add user
  const addUser = async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }
      });
      
      if (error) throw error;
      
      // Refresh the user list
      await fetchUsers();
      
      toast({
        title: "User created",
        description: `${userData.firstName} ${userData.lastName} has been added successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error creating user',
        description: error.message || 'There was an error creating the user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user
  const updateUser = async (userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    password?: string;
  }) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.functions.invoke('update-user', {
        body: {
          userId: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          password: userData.password || undefined
        }
      });
      
      if (error) throw error;
      
      // Refresh the user list
      await fetchUsers();
      
      toast({
        title: "User updated",
        description: `${userData.firstName} ${userData.lastName} has been updated successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error updating user',
        description: error.message || 'There was an error updating the user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset user password
  const resetPassword = async (userId: string, newPassword: string) => {
    try {
      setIsLoading(true);
      
      if (!userId) return false;
      
      const { error } = await supabase.functions.invoke('update-user', {
        body: {
          userId,
          password: newPassword
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset",
        description: `Password has been reset successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error resetting password',
        description: error.message || 'There was an error resetting the password',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      setIsDeleting(true);
      
      if (!userId) return false;
      
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
      
      // Refresh the user list
      await fetchUsers();
      
      toast({
        title: "User deleted",
        description: `User has been deleted successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error deleting user',
        description: error.message || 'There was an error deleting the user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Bulk upload
  const bulkUpload = async (uploadFile: File) => {
    try {
      setIsBulkUploading(true);
      
      if (!uploadFile) {
        toast({
          title: 'No file selected',
          description: 'Please select a file to upload',
          variant: 'destructive',
        });
        return false;
      }
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      const { data, error } = await supabase.functions.invoke('bulk-create-users', {
        body: formData
      });
      
      if (error) throw error;
      
      // Reload the users list
      await fetchUsers();
      
      toast({
        title: "Bulk upload completed",
        description: data?.message || `Users have been added successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error in bulk upload:', error);
      toast({
        title: 'Error in bulk upload',
        description: error.message || 'There was an error processing the bulk upload',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsBulkUploading(false);
    }
  };
  
  return {
    users,
    pagination,
    isLoading,
    isDeleting,
    isBulkUploading,
    selectedUser,
    searchQuery,
    filterRole,
    sortBy,
    sortOrder,
    setSelectedUser,
    fetchUsers,
    handlePageChange,
    resetFilters,
    addUser,
    updateUser,
    resetPassword,
    deleteUser,
    bulkUpload
  };
}
