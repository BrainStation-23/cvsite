
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SettingCategory from '@/components/admin/SettingCategory';
import UniversitySettings from '@/components/admin/UniversitySettings';
import DepartmentSettings from '@/components/admin/DepartmentSettings';
import DegreeSettings from '@/components/admin/DegreeSettings';
import DesignationSettings from '@/components/admin/DesignationSettings';
import ReferenceSettings from '@/components/admin/reference/ReferenceSettings';

const PlatformSettings: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 pb-0">
          <h1 className="text-2xl font-semibold mb-6 text-cvsite-navy dark:text-white">Platform Settings</h1>
        </div>
        
        {/* Tabs with scrollable content */}
        <div className="flex-1 flex flex-col px-6 pb-6">
          <Tabs defaultValue="universities" className="flex flex-col h-full">
            <TabsList className="mb-4 flex-shrink-0">
              <TabsTrigger value="universities">Universities</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="degrees">Degrees</TabsTrigger>
              <TabsTrigger value="designations">Designations</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
              <TabsTrigger value="sbus">SBUs</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="universities" className="h-full">
                <UniversitySettings />
              </TabsContent>
              
              <TabsContent value="departments" className="h-full">
                <DepartmentSettings />
              </TabsContent>
              
              <TabsContent value="degrees" className="h-full">
                <DegreeSettings />
              </TabsContent>
              
              <TabsContent value="designations" className="h-full">
                <DesignationSettings />
              </TabsContent>
              
              <TabsContent value="references" className="h-full">
                <ReferenceSettings />
              </TabsContent>
              
              <TabsContent value="sbus" className="h-full">
                <SettingCategory title="SBUs" table="sbus" />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlatformSettings;
