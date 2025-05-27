
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
  const breadcrumbs = [
    { label: 'Admin', href: '/admin/dashboard' },
    { label: 'Platform Settings' }
  ];

  return (
    <DashboardLayout title="Platform Settings" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col h-full">
        <Tabs defaultValue="universities" className="flex flex-col h-full">
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="universities">Universities</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="degrees">Degrees</TabsTrigger>
              <TabsTrigger value="designations">Designations</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
              <TabsTrigger value="sbus">SBUs</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="universities" className="mt-0">
              <UniversitySettings />
            </TabsContent>
            
            <TabsContent value="departments" className="mt-0">
              <DepartmentSettings />
            </TabsContent>
            
            <TabsContent value="degrees" className="mt-0">
              <DegreeSettings />
            </TabsContent>
            
            <TabsContent value="designations" className="mt-0">
              <DesignationSettings />
            </TabsContent>
            
            <TabsContent value="references" className="mt-0">
              <ReferenceSettings />
            </TabsContent>
            
            <TabsContent value="sbus" className="mt-0">
              <SettingCategory title="SBUs" table="sbus" />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PlatformSettings;
