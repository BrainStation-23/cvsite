
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import SbuSettings from '@/components/admin/SbuSettings';
import SystemHealthSettings from '@/components/admin/system-health/SystemHealthSettings';
import JobRoleSettings from '@/components/admin/JobRoleSettings';
import JobTypeSettings from '@/components/admin/JobTypeSettings';

const SystemConfigurationSettings: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Configuration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure system-wide settings including SBUs, job roles, job types, and system health.
            </p>
          </div>
        </div>

        <Tabs defaultValue="sbus" className="flex flex-col h-full">
          {/* Fixed header with tabs */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-0">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 border-b-0">
              <TabsTrigger 
                value="sbus" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                SBUs
              </TabsTrigger>
              <TabsTrigger 
                value="job-roles" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Job Roles
              </TabsTrigger>
              <TabsTrigger 
                value="job-types" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Job Types
              </TabsTrigger>
              <TabsTrigger 
                value="system-health" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                System Health
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-1 min-h-0">
            <TabsContent value="sbus" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <SbuSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="job-roles" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <JobRoleSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="job-types" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <JobTypeSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="system-health" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <SystemHealthSettings />
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
  );
};

export default SystemConfigurationSettings;
