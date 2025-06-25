
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from './StatCard';
import { SkillsChart } from './SkillsChart';
import { ExperienceChart } from './ExperienceChart';
import { IncompleteProfilesTable } from './IncompleteProfilesTable';
import { Users, CheckCircle, BarChart, Activity, AlertTriangle, TrendingUp, Building2, Database } from 'lucide-react';

interface TabbedDashboardProps {
  analytics: any;
  isLoading: boolean;
}

export const TabbedDashboard: React.FC<TabbedDashboardProps> = ({ analytics, isLoading }) => {
  const incompleteCount = analytics.incompleteProfiles.length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Key Metrics Row - Always visible */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
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

      {/* Tabbed Analytics Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <Activity className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Skills & Experience</span>
            <span className="sm:hidden">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <Building2 className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Departments</span>
            <span className="sm:hidden">Depts</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <Database className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Data Management</span>
            <span className="sm:hidden">Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <IncompleteProfilesTable 
              data={analytics.incompleteProfiles} 
              isLoading={isLoading} 
            />
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <SkillsChart data={analytics.skillMatrix} isLoading={isLoading} />
            <ExperienceChart data={analytics.experienceDistribution} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Placeholder for Department Analytics */}
            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-gray-500">
                Department analytics coming soon...
              </div>
            </div>
            
            {/* Placeholder for SBU Analytics */}
            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">SBU Analytics</h3>
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-gray-500">
                SBU analytics coming soon...
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <div className="space-y-4 md:space-y-6">
            <IncompleteProfilesTable 
              data={analytics.incompleteProfiles} 
              isLoading={isLoading} 
            />
            
            {/* Placeholder for additional data management tools */}
            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Data Quality Insights</h3>
              <div className="h-[150px] md:h-[200px] flex items-center justify-center text-gray-500">
                Additional data management tools coming soon...
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
