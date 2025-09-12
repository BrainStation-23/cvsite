import React from 'react';
import { IncompleteProfilesTableOptimized } from '../../components/admin/dashboard/IncompleteProfilesTableOptimized';

const EmployeeDataManagement: React.FC = () => {
  return (
    <div>
       {/* Incomplete Profiles - Now with lazy loading and pagination */}
       <div>
          <h2 className="text-xl font-semibold mb-4">CV Completeness Details</h2>
          <IncompleteProfilesTableOptimized />
        </div>
    </div>
  );
};

export default EmployeeDataManagement;
