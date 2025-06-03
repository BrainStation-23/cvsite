
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw, UserPlus } from 'lucide-react';
import { useUserManagement } from '@/hooks/use-user-management';
import UserSearchFilters from '@/components/admin/UserSearchFilters';
import UserList from '@/components/admin/UserList';
import UserPagination from '@/components/admin/UserPagination';
import { 
  AddUserDialog, 
  EditUserDialog, 
  ResetPasswordDialog, 
  DeleteUserDialog, 
  BulkUploadDialog
} from '@/components/admin/UserDialogs';
import { UserData, SortColumn, SortOrder } from '@/hooks/types/user-management';
import { UserRole } from '@/types';

const UserManagement: React.FC = () => {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  
  const {
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
  } = useUserManagement();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleSearch = (query: string | null) => {
    fetchUsers({ page: 1, search: query });
  };
  
  const handleFilterRole = (role: UserRole | null) => {
    fetchUsers({ page: 1, role });
  };
  
  const handleSortChange = (column: SortColumn, order: SortOrder) => {
    fetchUsers({ sortColumn: column, sortDirection: order });
  };
  
  const handlePerPageChange = (perPage: number) => {
    fetchUsers({ page: 1, perPage });
  };
  
  const handleResetPasswordClick = (user: UserData) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };
  
  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };
  
  const handleDeleteClick = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  // Enhanced handlers that automatically close dialogs and refresh
  const handleAddUserSuccess = async (userData: any) => {
    const success = await addUser(userData);
    if (success) {
      setIsAddUserDialogOpen(false);
    }
    return success;
  };

  const handleEditUserSuccess = async (userData: any) => {
    if (!selectedUser) return false;
    const success = await updateUser(selectedUser.id, userData);
    if (success) {
      setIsEditUserDialogOpen(false);
    }
    return success;
  };

  const handleResetPasswordSuccess = async () => {
    if (!selectedUser) return false;
    const success = await resetPassword(selectedUser.id);
    if (success) {
      setIsResetPasswordDialogOpen(false);
    }
    return success;
  };

  const handleDeleteUserSuccess = async () => {
    if (!selectedUser) return false;
    const success = await deleteUser(selectedUser.id);
    if (success) {
      setIsDeleteUserDialogOpen(false);
    }
    return success;
  };

  const handleBulkUploadSuccess = async (users: any[]) => {
    const success = await bulkUpload(users);
    if (success) {
      setIsBulkUploadDialogOpen(false);
    }
    return success;
  };
  
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">User Management</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsBulkUploadDialogOpen(true)}
          >
            <Upload size={16} />
            <span className="hidden md:inline">Bulk Upload</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => fetchUsers()}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsAddUserDialogOpen(true)}
          >
            <UserPlus size={16} />
            <span className="hidden md:inline">Add User</span>
          </Button>
        </div>
      </div>
      
      <UserSearchFilters
        onSearch={handleSearch}
        onFilterRole={handleFilterRole}
        onSortChange={handleSortChange}
        onReset={resetFilters}
        searchQuery={searchQuery}
        currentRole={filterRole}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isLoading}
      />
      
      <UserList
        users={users}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onResetPassword={handleResetPasswordClick}
        onDelete={handleDeleteClick}
      />
      
      <UserPagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        isLoading={isLoading}
      />
      
      {/* Dialogs */}
      <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onAddUser={handleAddUserSuccess}
        isLoading={isLoading}
      />
      
      <EditUserDialog
        isOpen={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
        user={selectedUser}
        onUpdateUser={handleEditUserSuccess}
        isLoading={isLoading}
      />
      
      <ResetPasswordDialog
        isOpen={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
        user={selectedUser}
        onResetPassword={handleResetPasswordSuccess}
        isLoading={isLoading}
      />
      
      <DeleteUserDialog
        isOpen={isDeleteUserDialogOpen}
        onOpenChange={setIsDeleteUserDialogOpen}
        user={selectedUser}
        onDeleteUser={handleDeleteUserSuccess}
        isDeleting={isDeleting}
      />
      
      <BulkUploadDialog
        isOpen={isBulkUploadDialogOpen}
        onOpenChange={setIsBulkUploadDialogOpen}
        onBulkUpload={handleBulkUploadSuccess}
        isBulkUploading={isBulkUploading}
      />
    </DashboardLayout>
  );
};

export default UserManagement;
