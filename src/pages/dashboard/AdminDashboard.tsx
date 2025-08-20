
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { ProfileStatisticsOverview } from '../../components/admin/dashboard/ProfileStatisticsOverview';
import { IncompleteProfilesTable } from '../../components/admin/dashboard/IncompleteProfilesTable';

const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of profiles and CV completeness across the organization
          </p>
        </div>

        {/* Profile Statistics Overview */}
        <div>
          <ProfileStatisticsOverview />
        </div>

        {/* Incomplete Profiles */}
        <div>
          <h2 className="text-xl font-semibold mb-4">CV Completeness Details</h2>
          <IncompleteProfilesTable />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
