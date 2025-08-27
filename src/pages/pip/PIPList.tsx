
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';
import { PIPListFilters } from '@/components/pip/PIPListFilters';
import { PIPListTable } from '@/components/pip/PIPListTable';
import { usePIPManagement } from '@/hooks/use-pip-management';
import { PIPEditDialog } from '@/components/pip/PIPEditDialog';
import { PIPDeleteDialog } from '@/components/pip/PIPDeleteDialog';
import { PIP } from '@/types/pip';

const PIPList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPIPForEdit, setSelectedPIPForEdit] = useState<PIP | null>(null);
  const [selectedPIPForDelete, setSelectedPIPForDelete] = useState<PIP | null>(null);
  
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

  const handleInitiatePIP = () => {
    navigate('/admin/pip/initiate');
  };

  const handleEditPIP = (pip: PIP) => {
    // Navigate to PM Review page instead of edit page
    navigate(`/admin/pip/pm-review/${pip.pip_id}`);
  };

  const handleDeletePIP = (pip: PIP) => {
    setSelectedPIPForDelete(pip);
  };

  const handleViewPIP = (pip: PIP) => {
    navigate(`/admin/pip/pm-review/${pip.pip_id}`);
  };

  const confirmDeletePIP = () => {
    if (selectedPIPForDelete) {
      deletePIP(selectedPIPForDelete.pip_id);
      setSelectedPIPForDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-cvsite-teal" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Performance Improvement Plans
              </h1>
              <p className="text-muted-foreground">
                Manage and track performance improvement plans for employees
              </p>
            </div>
          </div>
          
          <Button onClick={handleInitiatePIP} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Initiate New PIP
          </Button>
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

        {/* Edit Dialog */}
        {selectedPIPForEdit && (
          <PIPEditDialog
            pip={selectedPIPForEdit}
            isOpen={!!selectedPIPForEdit}
            onClose={() => setSelectedPIPForEdit(null)}
          />
        )}

        {/* Delete Dialog */}
        {selectedPIPForDelete && (
          <PIPDeleteDialog
            pip={selectedPIPForDelete}
            isOpen={!!selectedPIPForDelete}
            onClose={() => setSelectedPIPForDelete(null)}
            onConfirm={confirmDeletePIP}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PIPList;
