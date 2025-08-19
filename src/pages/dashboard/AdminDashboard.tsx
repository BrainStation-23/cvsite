
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { TabbedDashboard } from '../../components/dashboard/TabbedDashboard';
import { useDashboardAnalytics } from '../../hooks/use-dashboard-analytics';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { analytics, isLoading, exportIncompleteProfiles } = useDashboardAnalytics();

  // Debug logging
  console.log('=== TABBED ADMIN DASHBOARD DEBUG ===');
  console.log('Component: src/pages/dashboard/AdminDashboard.tsx');
  console.log('isLoading:', isLoading);
  console.log('analytics.incompleteProfiles.length:', analytics.incompleteProfiles.length);
  console.log('exportIncompleteProfiles function exists:', !!exportIncompleteProfiles);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">Dashboard (Tabbed)</h1>
          {analytics.incompleteProfiles.length > 0 && (
            <Button
              onClick={() => {
                console.log('Export button clicked in tabbed dashboard');
                exportIncompleteProfiles();
              }}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Export Incomplete Profiles ({analytics.incompleteProfiles.length})
            </Button>
          )}
        </div>
        
        {/* Debug info */}
        <div className="bg-blue-100 p-4 rounded border">
          <p><strong>Debug Info (Tabbed Dashboard):</strong></p>
          <p>Loading: {isLoading ? 'true' : 'false'}</p>
          <p>Incomplete Profiles Count: {analytics.incompleteProfiles.length}</p>
          <p>Should show button: {analytics.incompleteProfiles.length > 0 ? 'YES' : 'NO'}</p>
        </div>
        
        <TabbedDashboard analytics={analytics} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
