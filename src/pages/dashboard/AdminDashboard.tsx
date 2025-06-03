
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { StatCard } from '../../components/dashboard/StatCard';
import { SkillsChart } from '../../components/dashboard/SkillsChart';
import { ExperienceChart } from '../../components/dashboard/ExperienceChart';
import { useDashboardAnalytics } from '../../hooks/use-dashboard-analytics';
import { Users, CheckCircle, BarChart, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { analytics, isLoading } = useDashboardAnalytics();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Charts - Updated layout for better responsiveness */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SkillsChart data={analytics.skillMatrix} isLoading={isLoading} />
          <ExperienceChart data={analytics.experienceDistribution} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
