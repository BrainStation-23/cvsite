
import React from 'react';
import { ProfileStatisticsOverview } from '../../components/admin/dashboard/ProfileStatisticsOverview';
import { IncompleteProfilesTableOptimized } from '../../components/admin/dashboard/IncompleteProfilesTableOptimized';

const CvDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          CV Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of profiles and CV completeness across the organization
        </p>
      </div>

      {/* Profile Statistics Overview */}
      <div>
        <ProfileStatisticsOverview />
      </div>

     
    </div>
  );
};

export default CvDashboard;
