
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { UserCheck, AlertCircle } from 'lucide-react';
import { PIPListTable } from '@/components/pip/PIPListTable';
import { ManagerPIPFilters } from '@/components/pip/ManagerPIPFilters';
import { usePIPManagement } from '@/hooks/use-pip-management';
import { useAuth } from '@/contexts/AuthContext';
import { PIP } from '@/types/pip';
import { Card, CardContent } from '@/components/ui/card';

const ManagerPIPList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    pips,
    pagination,
    isLoading,
    searchParams,
    updateSearchParams,
  } = usePIPManagement();

  // Auto-filter PIPs for the current manager on component mount
  useEffect(() => {
    if (user?.id) {
      console.log('Setting manager filter for user:', user.id);
      updateSearchParams({
        managerFilter: user.id,
        statusFilter: 'pm_feedback', // Only show PIPs that need PM feedback
        page: 1
      });
    }
  }, [user?.id, updateSearchParams]);

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handlePMReview = (pip: PIP) => {
    navigate(`/manager/pip/pm-review/${pip.pip_id}`);
  };

  const handleViewPIP = (pip: PIP) => {
    navigate(`/manager/pip/view/${pip.pip_id}`);
  };

  // Filter PIPs that are assigned to the current manager and in the appropriate status
  const relevantPips = pips.filter(pip => {
    // Check if PIP is assigned to current manager
    const isAssignedToManager = pip.manager_id === user?.id;
    
    // Check status based on current filter
    const statusFilter = searchParams.statusFilter;
    let statusMatch = true;
    
    if (statusFilter === 'pm_feedback') {
      statusMatch = pip.status === 'pm_feedback';
    } else if (statusFilter === 'hr_review') {
      statusMatch = pip.status === 'hr_review';
    }
    // If statusFilter is null or 'all', show all statuses
    
    return isAssignedToManager && statusMatch;
  });

  console.log('Current search params:', searchParams);
  console.log('All PIPs:', pips);
  console.log('Filtered PIPs for manager:', relevantPips);
  console.log('Current user ID:', user?.id);

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
              Review and provide feedback on Performance Improvement Plans for your team members
            </p>
          </div>
        </div>

        {/* Simplified Filters for Managers */}
        <ManagerPIPFilters
          searchQuery={searchParams.searchQuery || ''}
          onSearchQueryChange={(value) => updateSearchParams({ searchQuery: value })}
          statusFilter={searchParams.statusFilter || null}
          onStatusFilterChange={(value) => updateSearchParams({ statusFilter: value })}
          isLoading={isLoading}
        />

        {/* Show message if no PIPs are assigned */}
        {!isLoading && relevantPips.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No PIPs Assigned for Review
              </h3>
              <p className="text-muted-foreground">
                You don't have any Performance Improvement Plans assigned for review at this time.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        {(relevantPips.length > 0 || isLoading) && (
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
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerPIPList;
