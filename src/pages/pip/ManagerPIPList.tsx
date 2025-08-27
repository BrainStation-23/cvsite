
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { UserCheck } from 'lucide-react';
import { PIPListFilters } from '@/components/pip/PIPListFilters';
import { PIPListTable } from '@/components/pip/PIPListTable';
import { usePIPManagement } from '@/hooks/use-pip-management';
import { PIP } from '@/types/pip';

const ManagerPIPList: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    pips,
    pagination,
    isLoading,
    searchParams,
    updateSearchParams,
    clearFilters,
  } = usePIPManagement();

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handlePMReview = (pip: PIP) => {
    navigate(`/manager/pip/pm-review/${pip.pip_id}`);
  };

  const handleViewPIP = (pip: PIP) => {
    navigate(`/manager/pip/view/${pip.pip_id}`);
  };

  // Filter PIPs that need PM feedback or are in PM review status
  const relevantPips = pips.filter(pip => 
    pip.status === 'pm_feedback' || pip.status === 'hr_review'
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <UserCheck className="h-8 w-8 text-cvsite-teal" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              PM Review
            </h1>
            <p className="text-muted-foreground">
              Review and provide feedback on Performance Improvement Plans assigned to you
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
          pips={relevantPips}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onEditPIP={handlePMReview}
          onDeletePIP={() => {}} // Managers can't delete PIPs
          onViewPIP={handleViewPIP}
          isDeleting={false}
          showActions={false} // Don't show delete actions for managers
        />
      </div>
    </DashboardLayout>
  );
};

export default ManagerPIPList;
