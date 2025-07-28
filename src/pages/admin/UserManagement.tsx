import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw, UserPlus, Download, Users, Trash2 } from 'lucide-react';
import { useUserManagement } from '@/hooks/use-user-management';
import UserSearchFilters from '@/components/admin/UserSearchFilters';
import UserList from '@/components/admin/UserList';
import UserPagination from '@/components/admin/UserPagination';
import { ResetPasswordDialog, DeleteUserDialog, BulkUploadDialog, BulkDeleteUsersDialog } from '@/components/admin/UserDialogs';
import { UserData, SortColumn, SortOrder } from '@/hooks/types/user-management';
import { UserRole } from '@/types';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

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
    resetPassword,
    deleteUser,
    bulkUpload,
    bulkUpdate,
    exportUsers
  } = useUserManagement();

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (query: string | null) => {
    fetchUsers({
      page: 1,
      search: query
    });
  };

  const handleFilterRole = (role: UserRole | null) => {
    fetchUsers({
      page: 1,
      role
    });
  };

  const handleSortChange = (column: SortColumn, order: SortOrder) => {
    fetchUsers({
      sortColumn: column,
      sortDirection: order
    });
  };

  const handlePerPageChange = (perPage: number) => {
    fetchUsers({
      page: 1,
      perPage
    });
  };

  const handleResetPasswordClick = (user: UserData) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleEditClick = (user: UserData) => {
    navigate(`/admin/users/edit/${user.id}`);
  };

  const handleDeleteClick = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  const handleAddUserClick = () => {
    navigate('/admin/users/add');
  };

  const handleResetPasswordSuccess = async (newPassword: string) => {
    if (!selectedUser) return false;
    const success = await resetPassword(selectedUser.id, newPassword);
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

  const handleBulkCreateSuccess = async (file: File) => {
    const success = await bulkUpload(file);
    if (success) {
      setIsBulkCreateDialogOpen(false);
    }
    return success;
  };

  const handleBulkUpdateSuccess = async (file: File) => {
    const success = await bulkUpdate(file);
    if (success) {
      setIsBulkUpdateDialogOpen(false);
    }
    return success;
  };

  const handleBulkDeleteComplete = () => {
    fetchUsers(); // Refresh the user list after bulk delete
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">User Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={exportUsers} disabled={isLoading}>
            <Download size={16} />
            <span className="hidden md:inline">Export All</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" 
            onClick={() => setIsBulkDeleteDialogOpen(true)}
          >
            <Trash2 size={16} />
            <span className="hidden md:inline">Bulk Delete</span>
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsBulkUpdateDialogOpen(true)}>
            <Users size={16} />
            <span className="hidden md:inline">Bulk Update</span>
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsBulkCreateDialogOpen(true)}>
            <Upload size={16} />
            <span className="hidden md:inline">Bulk Create</span>
          </Button>
          
          <Button className="flex items-center gap-2" onClick={handleAddUserClick}>
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
      
      <BulkDeleteUsersDialog 
        isOpen={isBulkDeleteDialogOpen} 
        onOpenChange={setIsBulkDeleteDialogOpen} 
        onComplete={handleBulkDeleteComplete}
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
        isOpen={isBulkCreateDialogOpen} 
        onOpenChange={setIsBulkCreateDialogOpen} 
        onBulkUpload={handleBulkCreateSuccess} 
        isBulkUploading={isBulkUploading} 
        mode="create" 
        title="Bulk Create Users" 
        description="Upload a CSV file to create new users in bulk." 
      />
      
      <BulkUploadDialog 
        isOpen={isBulkUpdateDialogOpen} 
        onOpenChange={setIsBulkUpdateDialogOpen} 
        onBulkUpload={handleBulkUpdateSuccess} 
        isBulkUploading={isBulkUploading} 
        mode="update" 
        title="Bulk Update Users" 
        description="Upload a CSV file to update existing users in bulk." 
      />
    </DashboardLayout>
  );
};

export default UserManagement;
