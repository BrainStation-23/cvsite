import { useUserState } from './user-management/use-user-state';
import { useUserListing } from './user-management/use-user-listing';
import { useUserCreation } from './user-management/use-user-creation';
import { useUserUpdate } from './user-management/use-user-update';
import { useUserDeletion } from './user-management/use-user-deletion';
import { useUserExport } from './user-management/use-user-export';

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
  const exportHook = useUserExport(state);
  
  // Enhanced delete function that refreshes the list
  const deleteUserWithRefresh = async (userId: string) => {
    const success = await deletion.deleteUser(userId, () => {
      // Refresh the user list after successful deletion
      listing.fetchUsers();
    });
    return success;
  };

  // Enhanced add user function that refreshes the list
  const addUserWithRefresh = async (userData: any) => {
    const success = await creation.addUser(userData);
    if (success) {
      // Refresh the user list after successful creation
      listing.fetchUsers();
    }
    return success;
  };

  // Enhanced update user function that refreshes the list
  const updateUserWithRefresh = async (userId: string, userData: any) => {
    const success = await update.updateUser({
      id: userId,
      ...userData
    });
    if (success) {
      // Refresh the user list after successful update
      listing.fetchUsers();
    }
    return success;
  };

  // Enhanced reset password function that shows feedback
  const resetPasswordWithFeedback = async (userId: string, newPassword: string) => {
    const success = await update.resetPassword(userId, newPassword);
    if (success) {
      // No need to refresh list for password reset, just show feedback
    }
    return success;
  };

  // Enhanced bulk upload function that refreshes the list
  const bulkUploadWithRefresh = async (file: File) => {
    const success = await creation.bulkUpload(file);
    if (success) {
      // Refresh the user list after successful bulk upload
      listing.fetchUsers();
    }
    return success;
  };
  
  // Return combined API with enhanced functions
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
    
    // Methods from sub-hooks (listing)
    fetchUsers: listing.fetchUsers,
    handlePageChange: listing.handlePageChange,
    resetFilters: listing.resetFilters,
    
    // Enhanced methods that include auto-refresh and better feedback
    addUser: addUserWithRefresh,
    updateUser: updateUserWithRefresh,
    resetPassword: resetPasswordWithFeedback,
    deleteUser: deleteUserWithRefresh,
    bulkUpload: bulkUploadWithRefresh,
    
    // Export functionality
    exportUsers: exportHook.exportUsers
  };
}
