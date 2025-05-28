
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
        <Tabs defaultValue="universities" className="flex flex-col h-full">
          <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="universities">Universities</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="degrees">Degrees</TabsTrigger>
              <TabsTrigger value="designations">Designations</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
              <TabsTrigger value="sbus">SBUs</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="universities" className="mt-0 p-6">
              <UniversitySettings />
            </TabsContent>
            
            <TabsContent value="departments" className="mt-0 p-6">
              <DepartmentSettings />
            </TabsContent>
            
            <TabsContent value="degrees" className="mt-0 p-6">
              <DegreeSettings />
            </TabsContent>
            
            <TabsContent value="designations" className="mt-0 p-6">
              <DesignationSettings />
            </TabsContent>
            
            <TabsContent value="references" className="mt-0 p-6">
              <ReferenceSettings />
            </TabsContent>
            
            <TabsContent value="sbus" className="mt-0 p-6">
              <SettingCategory title="SBUs" table="sbus" />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PlatformSettings;
