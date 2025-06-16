
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { TabbedDashboard } from '../../components/dashboard/TabbedDashboard';
import { useDashboardAnalytics } from '../../hooks/use-dashboard-analytics';

const AdminDashboard: React.FC = () => {
  const { analytics, isLoading } = useDashboardAnalytics();

  return (
    <DashboardLayout>
      <TabbedDashboard analytics={analytics} isLoading={isLoading} />
    </DashboardLayout>
  );
};

export default AdminDashboard;
