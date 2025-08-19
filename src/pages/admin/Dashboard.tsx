
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useDashboardAnalytics } from '@/hooks/use-dashboard-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { SkillsChart } from '@/components/dashboard/SkillsChart';
import { ExperienceChart } from '@/components/dashboard/ExperienceChart';
import { IncompleteProfilesTable } from '@/components/dashboard/IncompleteProfilesTable';

const Dashboard: React.FC = () => {
  const { analytics, isLoading, exportIncompleteProfiles } = useDashboardAnalytics();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : analytics.totalEmployees}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profiles Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : analytics.profilesCompleted}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : `${analytics.completionRate.toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incomplete Profiles</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : analytics.incompleteProfiles.length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkillsChart 
            data={analytics.skillMatrix}
            isLoading={isLoading}
          />
          
          <ExperienceChart 
            data={analytics.experienceDistribution}
            isLoading={isLoading}
          />
        </div>
        
        {/* Incomplete Profiles Table */}
        <IncompleteProfilesTable 
          data={analytics.incompleteProfiles}
          isLoading={isLoading}
          onExport={exportIncompleteProfiles}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
