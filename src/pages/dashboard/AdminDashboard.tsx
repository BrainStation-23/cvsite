
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { StatCard } from '../../components/dashboard/StatCard';
import { SkillsChart } from '../../components/dashboard/SkillsChart';
import { ExperienceChart } from '../../components/dashboard/ExperienceChart';
import { IncompleteProfilesTable } from '../../components/dashboard/IncompleteProfilesTable';
import { useDashboardAnalytics } from '../../hooks/use-dashboard-analytics';
import { Users, CheckCircle, BarChart, Activity, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { analytics, isLoading } = useDashboardAnalytics();

  const incompleteCount = analytics.incompleteProfiles.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Employees"
            value={isLoading ? "..." : analytics.totalEmployees}
            icon={<Users className="h-4 w-4 text-cvsite-teal" />}
            description="Total registered employees"
          />
          <StatCard
            title="Profiles Completed"
            value={isLoading ? "..." : analytics.profilesCompleted}
            icon={<CheckCircle className="h-4 w-4 text-cvsite-teal" />}
            description="Employees with complete profiles"
          />
          <StatCard
            title="Incomplete Profiles"
            value={isLoading ? "..." : incompleteCount}
            icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
            description="Profiles missing sections"
          />
          <StatCard
            title="Completion Rate"
            value={isLoading ? "..." : `${analytics.completionRate}%`}
            icon={<BarChart className="h-4 w-4 text-cvsite-teal" />}
            description="Profile completion percentage"
          />
          <StatCard
            title="Active Skills"
            value={isLoading ? "..." : analytics.skillMatrix.length}
            icon={<Activity className="h-4 w-4 text-cvsite-teal" />}
            description="Unique skills in the platform"
          />
        </div>

        {/* Primary Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Skills Analytics */}
          <SkillsChart data={analytics.skillMatrix} isLoading={isLoading} />
          
          {/* Experience Distribution */}
          <ExperienceChart data={analytics.experienceDistribution} isLoading={isLoading} />
        </div>

        {/* Secondary Analytics Grid - Ready for expansion */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Placeholder for future analytics widgets */}
          <div className="space-y-6">
            {/* Department/SBU Analytics will go here */}
          </div>
          
          <div className="space-y-6">
            {/* Technology Trends or other analytics will go here */}
          </div>
        </div>

        {/* Full-width Section for Tables and Detailed Views */}
        <div className="space-y-6">
          {/* Incomplete Profiles Table */}
          <IncompleteProfilesTable 
            data={analytics.incompleteProfiles} 
            isLoading={isLoading} 
          />
          
          {/* Additional tables can be added here */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
