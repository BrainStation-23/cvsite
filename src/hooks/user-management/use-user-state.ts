
import { useState } from 'react';
import { UserData, PaginationData, UserRole, SortColumn, SortOrder } from '../types/user-management';

export function useUserState() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    totalCount: 0,
    filteredCount: 0,
    page: 1,
    perPage: 10,
    pageCount: 0
  });
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<UserRole | null>(null);
  const [sortBy, setSortBy] = useState<SortColumn>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  return {
    users,
    setUsers,
    selectedUser,
    setSelectedUser,
    isLoading,
    setIsLoading,
    isDeleting,
    setIsDeleting,
    isBulkUploading,
    setIsBulkUploading,
    pagination,
    setPagination,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  };
}
