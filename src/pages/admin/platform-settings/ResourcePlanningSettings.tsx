
import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ResourceTypeSettings from '@/components/admin/ResourceTypeSettings';
import BillTypeSettings from '@/components/admin/BillTypeSettings';
import ProjectTypeSettings from '@/components/admin/ProjectTypeSettings';
import ExpertiseTypeSettings from '@/components/admin/ExpertiseTypeSettings';
import WeeklyValidationScheduling from '@/components/admin/WeeklyValidationScheduling';
import WeeklyScoreCardScheduling from '@/components/admin/WeeklyScoreCardScheduling';

const ResourcePlanningSettings: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/platform-settings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Platform Settings
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Resource Planning
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage resource types, bill types, project types, expertise types, and scheduling for resource planning and project management.
            </p>
          </div>
        </div>

        <Tabs defaultValue="resource-types" className="flex flex-col h-full">
          {/* Fixed header with tabs */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-0">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 border-b-0">
              <TabsTrigger 
                value="resource-types" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Resource Types
              </TabsTrigger>
              <TabsTrigger 
                value="bill-types" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Bill Types
              </TabsTrigger>
              <TabsTrigger 
                value="project-types" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Project Types
              </TabsTrigger>
              <TabsTrigger 
                value="expertise-types" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Expertise Types
              </TabsTrigger>
              <TabsTrigger 
                value="weekly-validation-scheduling" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Weekly Validation Scheduling
              </TabsTrigger>
              <TabsTrigger 
                value="weekly-score-card-scheduling" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Weekly Score Card Scheduling
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-1 min-h-0">
            <TabsContent value="resource-types" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <ResourceTypeSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="bill-types" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <BillTypeSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="project-types" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <ProjectTypeSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="expertise-types" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <ExpertiseTypeSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="weekly-validation-scheduling" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <WeeklyValidationScheduling />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="weekly-score-card-scheduling" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <WeeklyScoreCardScheduling />
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ResourcePlanningSettings;
