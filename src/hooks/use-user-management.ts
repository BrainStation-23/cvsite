
import { useUserState } from './user-management/use-user-state';
import { useUserListing } from './user-management/use-user-listing';
import { useUserCreation } from './user-management/use-user-creation';
import { useUserUpdate } from './user-management/use-user-update';
import { useUserDeletion } from './user-management/use-user-deletion';

export type { UserData, PaginationData, SortColumn, SortOrder } from './types/user-management';

interface UseUserManagementProps {
  initialPage?: number;
  initialPerPage?: number;
}

export function useUserManagement({ 
  initialPage = 1, 
  initialPerPage = 10 
}: UseUserManagementProps = {}) {
  // Initialize shared state
  const state = useUserState();
  
  // Initialize sub-hooks
  const listing = useUserListing(state);
  const creation = useUserCreation(state);
  const update = useUserUpdate(state);
  const deletion = useUserDeletion(state);
  
  // Return combined API
  return {
    // State
    users: state.users,
    selectedUser: state.selectedUser,
    isLoading: state.isLoading,
    isDeleting: state.isDeleting,
    isBulkUploading: state.isBulkUploading,
    pagination: state.pagination,
    searchQuery: state.searchQuery,
    filterRole: state.filterRole,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    setSelectedUser: state.setSelectedUser,
    
    // Methods from sub-hooks
    ...listing,
    ...creation,
    ...update,
    ...deletion
  };
}
