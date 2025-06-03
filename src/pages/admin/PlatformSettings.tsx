
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import UniversitySettings from '@/components/admin/UniversitySettings';
import DepartmentSettings from '@/components/admin/DepartmentSettings';
import DegreeSettings from '@/components/admin/DegreeSettings';
import DesignationSettings from '@/components/admin/DesignationSettings';
import ReferenceSettings from '@/components/admin/reference/ReferenceSettings';
import SbuSettings from '@/components/admin/SbuSettings';

const PlatformSettings: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <Tabs defaultValue="universities" className="flex flex-col h-full">
          {/* Fixed header with tabs */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-0">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 border-b-0">
              <TabsTrigger 
                value="universities" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Universities
              </TabsTrigger>
              <TabsTrigger 
                value="departments" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Departments
              </TabsTrigger>
              <TabsTrigger 
                value="degrees" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Degrees
              </TabsTrigger>
              <TabsTrigger 
                value="designations" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Designations
              </TabsTrigger>
              <TabsTrigger 
                value="references" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                References
              </TabsTrigger>
              <TabsTrigger 
                value="sbus" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                SBUs
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-1 min-h-0">
            <TabsContent value="universities" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <UniversitySettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="departments" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <DepartmentSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="degrees" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <DegreeSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="designations" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <DesignationSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="references" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <ReferenceSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="sbus" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <SbuSettings />
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PlatformSettings;
