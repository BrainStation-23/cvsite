
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
      <Tabs defaultValue="universities" className="h-full flex flex-col">
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
        
        <div className="flex-1 min-h-0">
          <TabsContent value="universities" className="h-full p-6 mt-0">
            <UniversitySettings />
          </TabsContent>
          
          <TabsContent value="departments" className="h-full p-6 mt-0">
            <DepartmentSettings />
          </TabsContent>
          
          <TabsContent value="degrees" className="h-full p-6 mt-0">
            <DegreeSettings />
          </TabsContent>
          
          <TabsContent value="designations" className="h-full p-6 mt-0">
            <DesignationSettings />
          </TabsContent>
          
          <TabsContent value="references" className="h-full p-6 mt-0">
            <ReferenceSettings />
          </TabsContent>
          
          <TabsContent value="sbus" className="h-full p-6 mt-0">
            <SettingCategory title="SBUs" table="sbus" />
          </TabsContent>
        </div>
      </Tabs>
    </DashboardLayout>
  );
};

export default PlatformSettings;
