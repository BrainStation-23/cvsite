
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from 'lucide-react';
import { PIPListFilters } from '@/components/pip/PIPListFilters';
import { PIPListTable } from '@/components/pip/PIPListTable';
import { PIPDeleteDialog } from '@/components/pip/PIPDeleteDialog';
import { usePIPManagement } from '@/hooks/use-pip-management';
import { PIP } from '@/types/pip';

const PIPList: React.FC = () => {
  const navigate = useNavigate();
  const [pipToDelete, setPipToDelete] = useState<PIP | null>(null);
  
  const {
    pips,
    pagination,
    isLoading,
    searchParams,
    updateSearchParams,
    clearFilters,
    deletePIP,
    isDeleting,
  } = usePIPManagement();

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handleEditPIP = (pip: PIP) => {
    navigate(`/pip/edit/${pip.pip_id}`);
  };

  const handleDeletePIP = (pip: PIP) => {
    setPipToDelete(pip);
  };

  const handleViewPIP = (pip: PIP) => {
    navigate(`/pip/view/${pip.pip_id}`);
  };

  const confirmDelete = () => {
    if (pipToDelete) {
      deletePIP(pipToDelete.pip_id);
      setPipToDelete(null);
    }
  };

  const cancelDelete = () => {
    setPipToDelete(null);
  };

  return (
   
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <List className="h-8 w-8 text-cvsite-teal" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              PIP List
            </h1>
            <p className="text-muted-foreground">
              View and manage all Performance Improvement Plans
            </p>
          </div>
        </div>

        {/* Filters */}
        <PIPListFilters
          searchQuery={searchParams.searchQuery || ''}
          onSearchQueryChange={(value) => updateSearchParams({ searchQuery: value })}
          sbuFilter={searchParams.sbuFilter || null}
          onSbuFilterChange={(value) => updateSearchParams({ sbuFilter: value })}
          expertiseFilter={searchParams.expertiseFilter || null}
          onExpertiseFilterChange={(value) => updateSearchParams({ expertiseFilter: value })}
          managerFilter={searchParams.managerFilter || null}
          onManagerFilterChange={(value) => updateSearchParams({ managerFilter: value })}
          designationFilter={searchParams.designationFilter || null}
          onDesignationFilterChange={(value) => updateSearchParams({ designationFilter: value })}
          statusFilter={searchParams.statusFilter || null}
          onStatusFilterChange={(value) => updateSearchParams({ statusFilter: value })}
          sortBy={searchParams.sortBy || 'created_at'}
          onSortByChange={(value) => updateSearchParams({ sortBy: value })}
          sortOrder={searchParams.sortOrder || 'desc'}
          onSortOrderChange={(value) => updateSearchParams({ sortOrder: value })}
          onClearFilters={clearFilters}
          isLoading={isLoading}
        />

        {/* Results Table */}
        <PIPListTable
          pips={pips}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onEditPIP={handleEditPIP}
          onDeletePIP={handleDeletePIP}
          onViewPIP={handleViewPIP}
          isDeleting={isDeleting}
        />

        {/* Delete Confirmation Dialog */}
        <PIPDeleteDialog
          isOpen={!!pipToDelete}
          pip={pipToDelete}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDeleting={isDeleting}
        />
      </div>
  );
};

export default PIPList;
