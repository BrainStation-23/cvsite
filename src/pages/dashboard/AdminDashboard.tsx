
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { TabbedDashboard } from '../../components/dashboard/TabbedDashboard';
import { useDashboardAnalytics } from '../../hooks/use-dashboard-analytics';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { analytics, isLoading, exportIncompleteProfiles } = useDashboardAnalytics();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">Dashboard</h1>
          {analytics.incompleteProfiles.length > 0 && (
            <Button
              onClick={exportIncompleteProfiles}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Export Incomplete Profiles ({analytics.incompleteProfiles.length})
            </Button>
          )}
        </div>
        
        <TabbedDashboard analytics={analytics} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
