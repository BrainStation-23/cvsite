
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import { PIPListTable } from '@/components/pip/PIPListTable';
import { usePIPManagement } from '@/hooks/use-pip-management';
import { useAuth } from '@/contexts/AuthContext';
import { PIP } from '@/types/pip';

const ManagerPIPList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    pips,
    pagination,
    isLoading,
    updateSearchParams,
  } = usePIPManagement();

  // Set manager filter to current user on component mount
  React.useEffect(() => {
    if (user?.id) {
      updateSearchParams({ 
        managerFilter: user.id,
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

  // Filter PIPs that need PM feedback or are in PM review status
  const relevantPips = pips.filter(pip => 
    pip.status === 'pm_feedback' || pip.status === 'hr_review'
  );

  return (
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

      {/* Results Table */}
      <PIPListTable
        pips={relevantPips}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onEditPIP={handlePMReview}
        onDeletePIP={() => {}} // Managers can't delete PIPs
        onViewPIP={() => {}} // Managers don't need view functionality
        isDeleting={false}
        showActions={false} // Don't show delete actions for managers
        showViewButton={false} // Hide view details button for managers
      />
    </div>
  );
};

export default ManagerPIPList;
